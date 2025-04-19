const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
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
    followings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followingsNumber: { type: Number, default: 0 },
    followersNumber: { type: Number, default: 0 },
    posts: { type: Number, default: 0 },
    private: { type: Boolean, default: false },
    blockedby: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockeduser: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // URL for profile ima
});

module.exports = mongoose.model('User', userSchema);