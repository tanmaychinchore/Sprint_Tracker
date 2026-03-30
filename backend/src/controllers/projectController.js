const Project = require("../models/Project");
const Team = require("../models/Team");

// CREATE PROJECT
const createProject = async (req, res) => {
    try {
        const { name, description, teamId, deadline } = req.body;

        // check team exists
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        // check if user is part of team
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

module.exports = { createProject, getProjects, updateProject, deleteProject };