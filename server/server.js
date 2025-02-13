const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const { Server } = require("socket.io");  // Import Socket.io
require("dotenv").config();
const http = require("http");  // For creating HTTP server
const app = express();
connectDB();
const server = http.createServer(app);  // Create HTTP server for Socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",  // Frontend origin
        methods: ["GET", "POST"],
    },
});
// Middleware
app.use(cors());
app.use(express.json());

// ✅ Ensure routes are properly mounted
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);  // This makes /api/users/register and /api/users/login available

const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);

const marketRoutes = require('./routes/marketplace');
app.use('/api/marketplace', marketRoutes);

const storyroutes = require('./routes/storyRoutes');
app.use('/api/story', storyroutes);

// ✅ Socket.io Connection Handling
io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    // Handle message sending
    socket.on("send_message", (data) => {
        console.log("Message received:", data);

        // Broadcast message to the recipient
        io.to(data.recipientId).emit("receive_message", data);
    });

    // Handle joining personal rooms for private messaging
    socket.on("join_room", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their personal room`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on Port ${PORT}`));