const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: [
                "TASK_SUBMITTED_FOR_REVIEW",
                "TASK_APPROVED",
                "TASK_ASSIGNED",
                "TEAM_INVITE",
            ],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
