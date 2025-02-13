const Story = require('../models/Story');

//  Create a new story
const createStory = async (req, res) => {
    try {
        const { userId, userName, mediaUrl, mediaType } = req.body;

        const newStory = new Story({
            userId,
            userName,
            mediaUrl,
            mediaType
        });

        await newStory.save();
        res.status(201).json({ message: "Story created successfully!", story: newStory });

    } catch (err) {
        console.error("🔥 Error creating story:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

//  Get all active (non-expired) stories
const getStories = async (req, res) => {
    try {
        console.log('Fetching active stories...');

        const stories = await Story.find({ expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });

        console.log('🟢 Active Stories:', stories);
        res.status(200).json(stories);
    } catch (err) {
        console.error("🔥 Error fetching stories:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

//  Mark a story as "viewed" by a user
const viewStory = async (req, res) => {
    try {
        const { storyId, userId } = req.body;

        // Add the user to the views array only if they haven't viewed it before
        const updatedStory = await Story.findByIdAndUpdate(
            storyId,
            { $addToSet: { views: userId } },
            { new: true }
        );

        if (!updatedStory) {
            return res.status(404).json({ message: "Story not found!" });
        }

        console.log(`👀 User ${userId} viewed story ${storyId}`);
        res.status(200).json({ message: "Story viewed!", story: updatedStory });

    } catch (err) {
        console.error("🔥 Error viewing story:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

//  Delete a story manually
const deleteStory = async (req, res) => {
    try {
        const { storyId } = req.params;

        const deletedStory = await Story.findByIdAndDelete(storyId);
        if (!deletedStory) {
            return res.status(404).json({ message: "Story not found!" });
        }

        console.log(`🗑 Story ${storyId} deleted.`);
        res.status(200).json({ message: "Story deleted successfully!" });

    } catch (err) {
        console.error("🔥 Error deleting story:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

//  Automatically delete expired stories (Scheduled Cleanup)
const deleteExpiredStories = async () => {
    try {
        const result = await Story.deleteMany({ expiresAt: { $lt: new Date() } });
        console.log(`🧹 Deleted ${result.deletedCount} expired stories.`);
    } catch (err) {
        console.error("🔥 Error deleting expired stories:", err);
    }
};

// (Optional) Run cleanup job every hour
//setInterval(deleteExpiredStories, 60 * 60 * 1000); // Runs every 1 hour

module.exports = { createStory, getStories, viewStory, deleteStory };