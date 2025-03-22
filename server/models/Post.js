const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the User
  userName: { type: String, required: true },  // User's name
  content: { type: String, required: true },  // Post content
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Store likes as an array of user IDs
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Store dislikes as an array of user IDs
  createdAt: { type: Date, default: Date.now },  // Timestamp
  postimg: { type: String },
  images: { type: Array },
  archived: { type: Boolean, default: false },
  tempdelete: { type: Boolean, default: false },
  deletetimestamp: { type: Date },
  shares: { type: Number, default: 0 }
});

// ✅ Fix OverwriteModelError
module.exports = mongoose.models.Post || mongoose.model("Post", postSchema);
