const UserStats = require("../models/UserStats");

const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await UserStats.find()
            .populate("user", "name email")
            .sort({ xp: -1 })
            .limit(10);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getLeaderboard };