const Notification = require("../models/Notification");

// GET MY NOTIFICATIONS
const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user })
            .populate("task", "title status")
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET UNREAD COUNT
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user,
            read: false,
        });

        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// MARK AS READ
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: req.user },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// MARK ALL AS READ
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user, read: false },
            { read: true }
        );

        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead };
