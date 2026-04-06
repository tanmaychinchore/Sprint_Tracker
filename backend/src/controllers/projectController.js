const Project = require("../models/Project");
const Team = require("../models/Team");

// CREATE PROJECT
const createProject = async (req, res) => {
    try {
        const { name, description, teamId, deadline } = req.body;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        const isMember = team.members.find(
            (m) => m.user.toString() === req.user
        );

        if (!isMember) {
            return res.status(403).json({ message: "Not part of team" });
        }

        const project = await Project.create({
            name,
            description,
            team: teamId,
            createdBy: req.user,
            deadline,
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET PROJECTS BY TEAM
const getProjects = async (req, res) => {
    try {
        const { teamId } = req.params;

        const projects = await Project.find({ team: teamId });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE PROJECT
const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const updated = await Project.findByIdAndUpdate(
            projectId,
            req.body,
            { new: true }
        );

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE PROJECT
const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        await Project.findByIdAndDelete(projectId);

        res.json({ message: "Project deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET ALL PROJECTS FOR CURRENT USER (across all their teams)
const getAllMyProjects = async (req, res) => {
    try {
        // Find all teams the user belongs to
        const teams = await Team.find({ "members.user": req.user });
        const teamIds = teams.map((t) => t._id);

        // Find all projects in those teams
        const projects = await Project.find({ team: { $in: teamIds } })
            .populate({
                path: "team",
                select: "name members owner"
            })
            .populate("createdBy", "name email");

        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET PROJECT MEMBERS (returns the team members for a project)
const getProjectMembers = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId).populate("team");
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const team = await Team.findById(project.team._id || project.team)
            .populate("members.user", "name email");

        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        res.json(team.members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createProject, getProjects, updateProject, deleteProject, getAllMyProjects, getProjectMembers };