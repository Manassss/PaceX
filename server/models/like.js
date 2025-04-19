const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }, // ✅ Ensure it's referencing Post model
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Like", likeSchema); // Ensure correct file case!
