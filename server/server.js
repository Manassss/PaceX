const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const PORT = process.env.PORT || 5001;
const socketIO = require("socket.io");  // Import Socket.io
require("dotenv").config();
const http = require("http");  // For creating HTTP server
const app = express();
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

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // User joins a private chat room
    socket.on("join_room", (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    // Handle message sending
    socket.on("send_message", (data) => {
        console.log("Message sent:", data);
        io.to(data.roomId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});
// Middleware


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

server.listen(PORT, () => console.log(`✅ Server running on Port ${PORT}`));