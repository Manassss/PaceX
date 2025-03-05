const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who receives the notification
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who triggered it
    type: {
        type: String,
        enum: ["like", "comment", "message"],
        required: true
    }, // Type of notification
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: false }, // For like/comment notifications
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: false }, // For chat notifications
    read: { type: Boolean, default: false }, // If the notification is seen
    createdAt: { type: Date, default: Date.now } // Timestamp
});

module.exports = mongoose.model("Notification", notificationSchema);