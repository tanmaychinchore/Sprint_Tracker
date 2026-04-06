const User = require("../models/User");
const Invitation = require("../models/Invitation");
const Team = require("../models/Team");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password, inviteToken } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // If invite token provided, accept the invitation and add to team
    let joinedTeam = null;
    if (inviteToken) {
      const invitation = await Invitation.findOne({
        token: inviteToken,
        status: "PENDING",
        expiresAt: { $gt: new Date() },
      });

      if (invitation) {
        // Verify the email matches
        if (invitation.email.toLowerCase() === email.toLowerCase()) {
          const team = await Team.findById(invitation.team);
          if (team) {
            // Check not already a member (edge case)
            const alreadyMember = team.members.find(
              (m) => m.user.toString() === user._id.toString()
            );
            if (!alreadyMember) {
              team.members.push({
                user: user._id,
                role: invitation.role || "member",
              });
              await team.save();
              joinedTeam = team.name;
            }
          }

          // Mark invitation as accepted
          invitation.status = "ACCEPTED";
          await invitation.save();
        }
      }
    }

    res.status(201).json({
      message: joinedTeam
        ? `Account created and joined team "${joinedTeam}" successfully!`
        : "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      joinedTeam,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, getMe };