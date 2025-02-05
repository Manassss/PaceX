const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
require("dotenv").config();

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Ensure routes are properly mounted
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);  // This makes /api/users/register and /api/users/login available

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on Port ${PORT}`));