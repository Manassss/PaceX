const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /.+\.edu$/ },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "faculty", "admin"], default: "student" },
    joinedAt: { type: Date, default: Date.now },
    profileImage: { type: String, default: "" },
    university: { type: String, default: "Pace University" },
    major: { type: String },
    graduationYear: { type: Number },
    birthdate: { type: Date },
    bio: { type: String },
    // URL for profile ima
});

module.exports = mongoose.model('User', userSchema);