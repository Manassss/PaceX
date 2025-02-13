const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the User
    userName: { type: String, required: true },  // User's name
    content: { type: String, required: true },  // Post content
    likes: { type: Number, default: 0 },  // Number of likes
    dislikes: { type: Number, default: 0 },  // Number of dislikes
    createdAt: { type: Date, default: Date.now },  // Timestamp
    postimg: { type: String }
});

module.exports = mongoose.model('Post', postSchema);