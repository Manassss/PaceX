const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /.+\.edu$/ },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "faculty", "admin"], default: "student" },
    joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);