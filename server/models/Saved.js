const mongoose = require('mongoose');

const savedSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the User
    postId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }],  // Reference to the User

});

module.exports = mongoose.model('Saved', savedSchema);