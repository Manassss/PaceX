const mongoose = require('mongoose');

// Define a comment schema for embedded comments
const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the User
  userName: { type: String, required: true },  // User's name
  content: { type: String, required: true },  // Post content
  // Store likes as an array of user IDs
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Store dislikes as an array of user IDs (if needed)
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Store comments as an array of comment objects
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },  // Timestamp
  postimg: { type: String }
});

module.exports = mongoose.model('Post', postSchema);
