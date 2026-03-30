const Task = require("../models/Task");

// CREATE TASK
const createTask = async (req, res) => {
    try {
        const { title, description, projectId, sprintId, priority, dueDate } = req.body;

        const task = await Task.create({
            title,
            description,
            project: projectId,
            sprint: sprintId,
            priority,
            dueDate,
            createdBy: req.user,
        });

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
            .populate("assignedTo", "name email");

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

// UPDATE TASK
const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;

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

// CHANGE STATUS (KANBAN MOVE)
const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        const updated = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true }
        );

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

        await Task.findByIdAndDelete(taskId);

        res.json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTask, getTasksByProject, getTasksBySprint, updateTask, updateTaskStatus, deleteTask };