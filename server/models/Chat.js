const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the User
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the User
    text: { type: String, required: true },  // Post content
    createdAt: { type: Date, default: Date.now },  // Timestamp

});

module.exports = mongoose.model('Chat', chatSchema);