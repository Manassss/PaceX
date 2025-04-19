const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  username: { type: String, required: true },
  userimg: { type: String, default: "" },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  image: { type: String, default: "" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // ✅ FIXED: Ensure `comments` always exists
  comments: {
    type: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    default: [] // ← This is the key fix
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CommunityPost", communityPostSchema);
