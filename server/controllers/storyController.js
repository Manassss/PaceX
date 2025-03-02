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
        // console.log('Fetching active stories...');

        const stories = await Story.find({ expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });

        // console.log('🟢 Active Stories:', stories);
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

        if (!storyId || !userId) {
            return res.status(400).json({ message: "Story ID and User ID are required!" });
        }

        console.log(`storyId- ${storyId} userid-${userId}`);

        // ✅ First, find the story to check if the user already viewed it
        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({ message: "Story not found!" });
        }

        // ✅ Check if the userId is already in the views array
        const hasViewed = story.views.includes(userId);

        if (!hasViewed) {
            // ✅ If user is new, add to views and increment viewsNumber
            story.views.push(userId);
            story.viewsNumber = story.views.length; // Count the total number of unique users

            await story.save(); // Save the updated story
            console.log(`👀 User ${userId} viewed story ${storyId} | Total Unique Views: ${story.viewsNumber}`);
        } else {
            console.log(`🔄 User ${userId} already viewed story ${storyId}, not incrementing count.`);
        }

        return res.status(200).json({ message: "Story viewed!", story });

    } catch (err) {
        console.error("🔥 Error viewing story:", err);
        return res.status(500).json({ message: "Server Error", error: err.message });
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