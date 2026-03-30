const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: String,
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
        },
        sprint: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Sprint",
        },
        status: {
            type: String,
            enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"],
            default: "TODO",
        },
        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            default: "MEDIUM",
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        dueDate: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);