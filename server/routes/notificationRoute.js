const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// ✅ Get Notifications for User
router.get("/:userId", async (req, res) => {
    try {
        console.log(`🔍 Fetching Notifications for User ${req.params.userId}`);
        const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        console.log(`✅ Found ${notifications.length} Notifications for User ${req.params.userId}`);
        res.json(notifications);
    } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        res.status(500).json({ message: "Server Error" });
    }
});


// ✅ Mark All as Read
router.put("/mark-read/:userId", async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.params.userId }, { $set: { read: true } });
        res.json({ message: "Notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
