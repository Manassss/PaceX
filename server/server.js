const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const PORT = process.env.PORT || 5001;
const socketIO = require("socket.io");  // Import Socket.io
require("dotenv").config();
const http = require("http");  // For creating HTTP server
const app = express();
const Notification = require("./models/Notification");
connectDB();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);  // Create HTTP server for Socket.io
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


// ✅ Attach io to app for use in controllers
app.set('io', io);

io.on("connection", (socket) => {
    console.log("✅ User Connected:", socket.id);

    // ✅ JOIN CHAT ROOM
    socket.on("join_room", (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    // ✅ HANDLE MESSAGES
    socket.on("send_message", (data) => {
        console.log("💬 Message Sent:", data);
        io.to(data.roomId).emit("receive_message", data);
    });

    // ✅ HANDLE NOTIFICATIONS
    socket.on("sendNotification", async ({ recipient, sender, type, postId, messageId }) => {
        try {
            // Save to DB (Optional)
            const newNotification = new Notification({
                recipient,
                sender,
                type,
                postId,
                messageId,
                createdAt: new Date(),
            });
            await newNotification.save();

            // Emit notification event to recipient
            io.emit(`notification-${recipient}`, newNotification);
            console.log(`📩 Notification sent to user: ${recipient}`);
        } catch (error) {
            console.error(" Error sending notification:", error);
        }
    });

    // ✅ HANDLE DISCONNECT
    socket.on("disconnect", () => {
        console.log(" User Disconnected:", socket.id);
    });
});


// ✅ Ensure routes are properly mounted
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);                      // This makes /api/users/register and /api/users/login available

const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);

const marketRoutes = require('./routes/marketplace');
app.use('/api/marketplace', marketRoutes);

const storyroutes = require('./routes/storyRoutes');
app.use('/api/story', storyroutes);

const chatroutes = require('./routes/chatRoutes');
app.use('/api/chat', chatroutes);

const commentroutes = require('./routes/commentRoutes');
app.use('/api/comment', commentroutes);

const communityroutes = require('./routes/communityRoutes');
app.use('/api/community', communityroutes);

const notificationroutes = require('./routes/notificationRoute');
app.use('/api/notify', notificationroutes);

const likeRoute = require('./routes/likeRoute'); // ✅ Match file name
app.use('/api/likes', likeRoute);

app.use("/api/notifications", require("./routes/notificationRoute"));

const sendNotification = (recipientId, notificationData) => {
    const eventName = `notification-${recipientId}`;
    console.log(`📡 Sending Notification to ${recipientId}:`, notificationData);
    io.emit(eventName, notificationData);
};
module.exports = { io, sendNotification };

server.listen(PORT, () => console.log(`✅ Server running on Port ${PORT}`));