const Notification = require("../models/Notification");
const User = require("../models/Userdetails");

const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "UserId is required." });
        }

        // ✅ Populate senderId to get `name` and `profileImage`
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .populate("senderId", "name profileImage");

        console.log("✅ Notifications Fetched:", notifications); // Debugging Log

        res.status(200).json(notifications);
    } catch (err) {
        console.error("🔥 Error fetching notifications:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

module.exports = { getNotifications };
