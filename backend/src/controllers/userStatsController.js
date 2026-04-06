const UserStats = require("../models/UserStats");
const mongoose = require("mongoose");

const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await UserStats.aggregate([
            // Group by user to deduplicate
            {
                $group: {
                    _id: "$user",
                    xp: { $sum: "$xp" },
                    tasksCompleted: { $sum: "$tasksCompleted" },
                    level: { $max: "$level" },
                },
            },
            // Sort by XP descending
            { $sort: { xp: -1 } },
            // Limit to top 10
            { $limit: 10 },
            // Lookup user details
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo",
                },
            },
            // Unwind user array
            { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
            // Reshape to expected format
            {
                $project: {
                    _id: 1,
                    xp: 1,
                    level: 1,
                    tasksCompleted: 1,
                    user: {
                        _id: "$userInfo._id",
                        name: "$userInfo.name",
                        email: "$userInfo.email",
                    },
                },
            },
        ]);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getLeaderboard };