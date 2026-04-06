const mongoose = require("mongoose");
const crypto = require("crypto");

const invitationSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },
        role: {
            type: String,
            default: "member",
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
            default: () => crypto.randomBytes(32).toString("hex"),
        },
        status: {
            type: String,
            enum: ["PENDING", "ACCEPTED", "EXPIRED"],
            default: "PENDING",
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Invitation", invitationSchema);
