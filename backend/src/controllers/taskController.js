const Task = require("../models/Task");
const Project = require("../models/Project");
const Team = require("../models/Team");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { rewardUser } = require("../services/gamificationService");
const { sendEmail } = require("../services/emailService");

// CREATE TASK
const createTask = async (req, res) => {
    try {
        const { title, description, projectId, sprintId, priority, dueDate, assignedTo } = req.body;

        const task = await Task.create({
            title,
            description,
            project: projectId,
            sprint: sprintId,
            priority,
            dueDate,
            assignedTo: assignedTo || undefined,
            createdBy: req.user,
        });

        // Notify assigned user
        if (assignedTo) {
            const assignedUser = await User.findById(assignedTo);
            if (assignedUser) {
                await Notification.create({
                    user: assignedTo,
                    type: "TASK_ASSIGNED",
                    message: `You have been assigned a new task: "${title}"`,
                    task: task._id,
                });

                await sendEmail(
                    assignedUser.email,
                    "New Task Assigned",
                    `You have been assigned a task: ${title}`
                );
            }
        }

        const io = req.app.get("io");
        io.to(projectId).emit("taskCreated", task);

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET TASKS BY PROJECT
const getTasksByProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const tasks = await Task.find({ project: projectId })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET TASKS BY SPRINT
const getTasksBySprint = async (req, res) => {
    try {
        const { sprintId } = req.params;

        const tasks = await Task.find({ sprint: sprintId });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper: Check if user is admin of the task's project team
const isAdminOfTaskProject = async (userId, task) => {
    const project = await Project.findById(task.project);
    if (!project) return false;

    const team = await Team.findById(project.team);
    if (!team) return false;

    const member = team.members.find(
        (m) => m.user.toString() === userId && m.role === "admin"
    );
    return !!member;
};

// Helper: Get admin(s) of a task's project team
const getTeamAdmins = async (task) => {
    const project = await Project.findById(task.project);
    if (!project) return [];

    const team = await Team.findById(project.team).populate("members.user", "name email");
    if (!team) return [];

    return team.members
        .filter((m) => m.role === "admin")
        .map((m) => m.user);
};

// UPDATE TASK
const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const isAdmin = await isAdminOfTaskProject(req.user, task);

        // Check if task is DONE — locked for non-admins
        if (!isAdmin && task.status === "DONE") {
            return res.status(403).json({ message: "Cannot modify a completed task" });
        }

        const updated = await Task.findByIdAndUpdate(
            taskId,
            req.body,
            { new: true }
        );

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CHANGE STATUS (KANBAN MOVE) — with strict role-based restrictions
const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        const task = await Task.findById(taskId).populate("assignedTo", "name email");
        if (!task) return res.status(404).json({ message: "Task not found" });

        const isAdmin = await isAdminOfTaskProject(req.user, task);
        const isAssignee = task.assignedTo && (
            (typeof task.assignedTo === 'object' && task.assignedTo._id.toString() === req.user) ||
            (task.assignedTo.toString() === req.user)
        );

        const previousStatus = task.status;

        // Validation Rules:
        if (status === "DONE" || (previousStatus === "REVIEW" && status === "IN_PROGRESS")) {
            // Only admin can approve (REVIEW -> DONE) or reject (REVIEW -> IN_PROGRESS)
            if (!isAdmin) {
                return res.status(403).json({ message: "Only an admin can approve or reject tasks from review" });
            }
        } 
        else if (
            (previousStatus === "TODO" && status === "IN_PROGRESS") ||
            (previousStatus === "IN_PROGRESS" && status === "REVIEW")
        ) {
            // Only ASSIGNEE can do this. NOT admin unless admin is assignee.
            if (!isAssignee) {
                return res.status(403).json({ message: "Only the assigned user can move this task forward" });
            }
        } 
        else {
            // Any other moves (e.g. TODO -> REVIEW skip, or IN_PROGRESS -> TODO)
            // Neither Admin or Member should be able to do this if we are enforcing strict flow
            return res.status(403).json({ message: "Invalid status transition" });
        }

        const updated = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true }
        ).populate("assignedTo", "name email");

        // Handle side effects based on status change
        if (status === "REVIEW" && previousStatus !== "REVIEW") {
            // Member submitted for review — notify admin(s)
            const admins = await getTeamAdmins(task);
            const submitter = await User.findById(req.user);
            const submitterName = submitter?.name || "A team member";

            for (const admin of admins) {
                if (admin && admin._id) {
                    await Notification.create({
                        user: admin._id,
                        type: "TASK_SUBMITTED_FOR_REVIEW",
                        message: `${submitterName} submitted "${task.title}" for review`,
                        task: task._id,
                    });

                    await sendEmail(
                        admin.email,
                        "Task Submitted for Review",
                        `${submitterName} has submitted the task "${task.title}" for your review.\n\nLog in to review and approve it.`
                    );
                }
            }
        }

        if (status === "DONE" && previousStatus !== "DONE") {
            // Admin approved — reward assignee and notify
            if (task.assignedTo) {
                const assigneeId = typeof task.assignedTo === "object" ? task.assignedTo._id : task.assignedTo;
                await rewardUser(assigneeId, 50); // +50 XP

                await Notification.create({
                    user: assigneeId,
                    type: "TASK_APPROVED",
                    message: `Your task "${task.title}" has been approved! +50 XP`,
                    task: task._id,
                });

                const assignee = await User.findById(assigneeId);
                if (assignee) {
                    await sendEmail(
                        assignee.email,
                        "Task Approved! 🎉",
                        `Great work! Your task "${task.title}" has been reviewed and approved.\n\nYou earned +50 XP!`
                    );
                }
            }
        }

        const io = req.app.get("io");
        io.to(updated.project.toString()).emit("taskUpdated", updated);

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE TASK
const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);
        if (task && task.status === "DONE") {
            return res.status(403).json({ message: "Cannot delete a completed task" });
        }

        await Task.findByIdAndDelete(taskId);

        res.json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET MY TASKS (assigned to or created by current user)
const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            $or: [
                { assignedTo: req.user },
                { createdBy: req.user },
            ],
        })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email")
            .populate({
                path: "project",
                populate: {
                    path: "team",
                    select: "name members owner"
                }
            })
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET ALL TEAM TASKS (for all team members)
const getTeamTasks = async (req, res) => {
    try {
        // Find all teams where user is a member
        const teams = await Team.find({
            "members.user": req.user
        });

        const teamIds = teams.map((t) => t._id);

        // Find all projects in those teams
        const projects = await Project.find({ team: { $in: teamIds } });
        const projectIds = projects.map((p) => p._id);

        // Find all tasks in those projects
        const tasks = await Task.find({ project: { $in: projectIds } })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email")
            .populate({
                path: "project",
                populate: {
                    path: "team",
                    select: "name members owner"
                }
            })
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createTask,
    getTasksByProject,
    getTasksBySprint,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getMyTasks,
    getTeamTasks,
};