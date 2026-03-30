const Team = require("../models/Team");
const User = require("../models/User");

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

// ADD MEMBER TO TEAM
const addMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { email, role } = req.body;

        // find team
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        // check if requester is admin
        const isAdmin = team.members.find(
            (m) => m.user.toString() === req.user && m.role === "admin"
        );

        if (!isAdmin) {
            return res.status(403).json({ message: "Only admin can add members" });
        }

        // find user by email
        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ message: "User not found" });
        }

        // check if already member
        const alreadyMember = team.members.find(
            (m) => m.user.toString() === userToAdd._id.toString()
        );

        if (alreadyMember) {
            return res.status(400).json({ message: "User already in team" });
        }

        // add member
        team.members.push({
            user: userToAdd._id,
            role: role || "member",
        });

        await team.save();

        res.json({ message: "Member added successfully", team });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTeam, getMyTeams, addMember };