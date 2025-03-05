const Chat = require("../models/Chat");
const User = require('../models/Userdetails')
const Notification = require('../models/Notification')

// ✅ Send a message (POST)
const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, text } = req.body;

        if (!senderId || !receiverId || !text) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newMessage = new Chat({ senderId, receiverId, text });
        await newMessage.save();
        console.log("sender", senderId);
        const notification = new Notification({
            recipient: receiverId, sender: senderId, type: "message", messageId: newMessage._id
        });
        await notification.save();

        res.status(201).json({ message: "Message sent successfully", chat: newMessage });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// ✅ Get chat history between two users (GET)
const getChatHistory = async (req, res) => {
    try {
        const { user1, user2 } = req.query;

        if (!user1 || !user2) {
            return res.status(400).json({ error: "Missing user IDs" });
        }
        //console.log(`user1:${user1} user2 ${user2}`);
        const chats = await Chat.find({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

const getdefaultUsers = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find all messages where user is sender or receiver
        const messages = await Chat.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        });

        // Extract unique user IDs from the messages
        const userIds = [...new Set(messages.flatMap(msg => [msg.senderId.toString(), msg.receiverId.toString()]))];

        // Remove the logged-in user's ID from the list
        const filteredUserIds = userIds.filter(id => id !== userId);

        // Fetch user details
        const users = await User.find({ _id: { $in: filteredUserIds } }).select('_id name profileImage');

        res.json(users);
    } catch (error) {
        console.error('Error fetching chat users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { sendMessage, getChatHistory, getdefaultUsers };