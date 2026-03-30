const Sprint = require("../models/Sprint");
const Project = require("../models/Project");

// CREATE SPRINT
const createSprint = async (req, res) => {
    try {
        const { name, goal, projectId, startDate, endDate } = req.body;

        // check project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const sprint = await Sprint.create({
            name,
            goal,
            project: projectId,
            startDate,
            endDate,
        });

        res.status(201).json(sprint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET SPRINTS BY PROJECT
const getSprints = async (req, res) => {
    try {
        const { projectId } = req.params;

        const sprints = await Sprint.find({ project: projectId });

        res.json(sprints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// START SPRINT
const startSprint = async (req, res) => {
    try {
        const { sprintId } = req.params;

        const sprint = await Sprint.findByIdAndUpdate(
            sprintId,
            { status: "ACTIVE" },
            { new: true }
        );

        res.json(sprint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// END SPRINT
const endSprint = async (req, res) => {
    try {
        const { sprintId } = req.params;

        const sprint = await Sprint.findByIdAndUpdate(
            sprintId,
            { status: "COMPLETED" },
            { new: true }
        );

        res.json(sprint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createSprint, getSprints, startSprint, endSprint };