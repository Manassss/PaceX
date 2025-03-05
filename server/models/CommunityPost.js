const mongoose = require("mongoose");

// Define a schema for community posts
const communityPostSchema = new mongoose.Schema({
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true }, // Reference to the community
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Creator of the post
    content: { type: String, required: true, maxlength: 2000 }, // Post content
    image: { type: String, default: "" }, // Optional image URL
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who liked the post
    comments: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        }
    ], // Embedded comments inside the post
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CommunityPost", communityPostSchema);