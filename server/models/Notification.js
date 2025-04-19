const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Recipient
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who triggered the action
    type: { type: String, enum: ["like", "comment", "follow", "message"], required: true }, // Type of notification
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: false }, // Optional: For likes/comments
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: false }, // Optional: For messages
    isRead: { type: Boolean, default: false }, // Track if notification is read
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
