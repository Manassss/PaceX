const Chat = require("../models/Chat");

// ✅ Send a message (POST)
const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, text } = req.body;

        if (!senderId || !receiverId || !text) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newMessage = new Chat({ senderId, receiverId, text });
        await newMessage.save();

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

module.exports = { sendMessage, getChatHistory };