const mongoose = require("mongoose");

// Define a community schema for university-focused social media groups
const communitySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, maxlength: 500 },
    coverImage: { type: String, default: "" }, // URL to community cover image
    members: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            role: { type: String, enum: ["admin", "moderator", "member"], default: "member" },
            joinedAt: { type: Date, default: Date.now },
        }
    ],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    posts: { type: Number, default: 0 },
    rules: { type: [String], default: [] }, // List of community rules
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Creator of the community

});

module.exports = mongoose.model("Community", communitySchema);