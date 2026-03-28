const Team = require("../models/Team");

// CREATE TEAM
const createTeam = async (req, res) => {
    try {
        const { name } = req.body;

        const team = await Team.create({
            name,
            owner: req.user,
            members: [{ user: req.user, role: "admin" }],
        });

        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET USER TEAMS
const getMyTeams = async (req, res) => {
    try {
        const teams = await Team.find({
            "members.user": req.user,
        }).populate("members.user", "name email");

        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTeam, getMyTeams };