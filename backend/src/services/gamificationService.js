const UserStats = require("../models/UserStats");

// calculate level
const calculateLevel = (xp) => {
    return Math.floor(xp / 100) + 1;
};

// reward user
const rewardUser = async (userId, points) => {
    let stats = await UserStats.findOne({ user: userId });

    if (!stats) {
        stats = await UserStats.create({ user: userId });
    }

    stats.xp += points;
    stats.tasksCompleted += 1;
    stats.level = calculateLevel(stats.xp);

    await stats.save();

    return stats;
};

module.exports = { rewardUser };