const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the User
    userName: { type: String, required: true },  // User's name
    mediaUrl: { type: String, required: true },  // URL for image or video
    mediaType: { type: String, enum: ['image', 'video'], required: true },  // Media type (image/video)
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Users who viewed the story
    expiresAt: { type: Date, default: () => Date.now() + 24 * 60 * 60 * 1000 },  // Expiry time (24 hours from creation)
    createdAt: { type: Date, default: Date.now },  // Timestamp when the story was created
<<<<<<< HEAD
    viewsNumber: { type: Number, default: 0 }
=======
    viewsNumber: { type: Number }
>>>>>>> origin/dev-manas
});

module.exports = mongoose.model('Story', storySchema);