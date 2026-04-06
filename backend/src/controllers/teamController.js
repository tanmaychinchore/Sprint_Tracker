const Team = require("../models/Team");
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const { sendEmail } = require("../services/emailService");

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

// ADD MEMBER TO TEAM (for existing users — kept for backward compat)
const addMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { email, role } = req.body;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        const isAdmin = team.members.find(
            (m) => m.user.toString() === req.user && m.role === "admin"
        );

        if (!isAdmin) {
            return res.status(403).json({ message: "Only admin can add members" });
        }

        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ message: "User not found" });
        }

        const alreadyMember = team.members.find(
            (m) => m.user.toString() === userToAdd._id.toString()
        );

        if (alreadyMember) {
            return res.status(400).json({ message: "User already in team" });
        }

        team.members.push({
            user: userToAdd._id,
            role: role || "member",
        });

        await team.save();

        await sendEmail(
            userToAdd.email,
            "Added to Team",
            `You have been added to team: ${team.name}`
        );

        res.json({ message: "Member added successfully", team });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// INVITE MEMBER (works for both existing and new users)
const inviteMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { email, role } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        // Check if requester is admin
        const isAdmin = team.members.find(
            (m) => m.user.toString() === req.user && m.role === "admin"
        );

        if (!isAdmin) {
            return res.status(403).json({ message: "Only admin can invite members" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // Check if already a member
            const alreadyMember = team.members.find(
                (m) => m.user.toString() === existingUser._id.toString()
            );

            if (alreadyMember) {
                return res.status(400).json({ message: "User is already a member of this team" });
            }

            // Add directly and notify
            team.members.push({
                user: existingUser._id,
                role: role || "member",
            });
            await team.save();

            const admin = await User.findById(req.user);

            await sendEmail(
                existingUser.email,
                `You've been added to ${team.name}`,
                `Hi ${existingUser.name},\n\n${admin.name} has added you to team "${team.name}" on SprintForge.\n\nLog in to start collaborating: ${process.env.FRONTEND_URL || "http://localhost:5173"}/login\n\nCheers,\nSprintForge`
            );

            return res.json({
                message: "Existing user added to team successfully",
                type: "ADDED",
                team,
            });
        }

        // User doesn't exist — create invitation
        // Check if there's already a pending invitation
        const existingInvite = await Invitation.findOne({
            email,
            team: teamId,
            status: "PENDING",
            expiresAt: { $gt: new Date() },
        });

        if (existingInvite) {
            return res.status(400).json({ message: "An invitation has already been sent to this email" });
        }

        const invitation = await Invitation.create({
            email,
            team: teamId,
            role: role || "member",
            invitedBy: req.user,
        });

        const registerLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/register/${invitation.token}`;
        const admin = await User.findById(req.user);

        await sendEmail(
            email,
            `You're invited to join ${team.name} on SprintForge`,
            `Hi there!\n\n${admin.name} has invited you to join team "${team.name}" on SprintForge.\n\nClick the link below to create your account and join the team:\n${registerLink}\n\nThis invitation expires in 7 days.\n\nCheers,\nSprintForge`
        );

        res.status(201).json({
            message: "Invitation sent successfully",
            type: "INVITED",
            invitation: {
                email: invitation.email,
                status: invitation.status,
                expiresAt: invitation.expiresAt,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// VERIFY INVITE TOKEN (used by the frontend register page)
const verifyInvite = async (req, res) => {
    try {
        const { token } = req.params;

        const invitation = await Invitation.findOne({
            token,
            status: "PENDING",
            expiresAt: { $gt: new Date() },
        })
            .populate("team", "name")
            .populate("invitedBy", "name");

        if (!invitation) {
            return res.status(404).json({ message: "Invitation not found or expired" });
        }

        res.json({
            email: invitation.email,
            teamName: invitation.team?.name,
            invitedBy: invitation.invitedBy?.name,
            role: invitation.role,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTeam, getMyTeams, addMember, inviteMember, verifyInvite };