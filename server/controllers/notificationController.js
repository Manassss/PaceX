const Notification = require("../models/Notification");

// ✅ Create Notification (Triggered when a user likes, comments, or sends a message)
const createNotification = async (req, res) => {
    try {
        const { recipient, sender, type, postId, messageId } = req.body;
        const notification = new Notification({ recipient, sender, type, postId, messageId });
        await notification.save();
        res.status(201).json({ message: "Notification created", notification });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get Notifications for a User
const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).populate("sender", "name profileImage");
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Mark Notification as Read
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        await Notification.findByIdAndUpdate(notificationId, { read: true });
        res.json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { markAsRead, createNotification, getUserNotifications }