const mongoose = require('mongoose');

// Define a comment schema for embedded comments
const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },  // Reference to the User
    post_userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, default: "" },
    userimg: { type: String, default: "" }
});


module.exports = mongoose.model("Comments", commentSchema);