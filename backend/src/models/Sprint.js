const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        goal: {
            type: String,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["PLANNED", "ACTIVE", "COMPLETED"],
            default: "PLANNED",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Sprint", sprintSchema);