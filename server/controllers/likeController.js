const mongoose = require("mongoose"); // ✅ Import mongoose FIRST
const ObjectId = mongoose.Types.ObjectId; // ✅ Now use ObjectId
const Post = require("../models/Post"); // ✅ Import Post model
const Like = require("../models/like"); // ✅ Import Like model
const Notification = require("../models/Notification");
const User = require("../models/Userdetails"); // ✅ Import User Model
const like = require("../models/like");

// ✅ Add Like
const addLike = async (req, res) => {
    try {
        const { userId, postId } = req.body;

        console.log("➡️ Received like request:", req.body);

        if (!userId || !postId) {
            return res.status(400).json({ message: "UserId and PostId are required." });
        }

        // ✅ Convert `userId` to `ObjectId` for consistency
        const userObjectId = new ObjectId(userId);

        // ✅ Ensure post exists
        const post = await Post.findById(postId);
        if (!post) {
            console.log("❌ Post not found!");
            return res.status(404).json({ message: "Post not found." });
        }

        // ✅ Fetch the sender (liking user) details
        const sender = await User.findById(userId);
        if (!sender) {
            console.log("❌ Sender user not found!");
            return res.status(404).json({ message: "Sender user not found." });
        }

        // ✅ Initialize `likes` and `dislikes` as arrays if undefined
        if (!Array.isArray(post.likes)) post.likes = [];
        if (!Array.isArray(post.dislikes)) post.dislikes = [];

        // ✅ Check if user already liked the post
        if (post.likes.some(user => user._id.toString() === userId)) {
            console.log("❌ User already liked this post.");
            return res.status(400).json({ message: "You have already liked this post." });
        }

        // ✅ Add like and save post
        post.likes.push(sender);
        await post.save();

        console.log("✅ Like added successfully!");

        // ✅ Prevent self-notification
        if (post.userId.toString() !== userId) {
            // ✅ Create notification and store sender details
            const notification = await Notification.create({
                userId: post.userId, // Post owner
                senderId: userId,
                senderName: sender.name,  // ✅ Store sender's name
                senderProfile: sender.profileImage,  // ✅ Store sender's profile image
                type: "like",
                postId: postId,
            });

            console.log(`✅ Notification Created: User ${sender.name} liked Post ${postId}`);

            // ✅ Emit Real-Time Notification via Socket.IO
            req.app.get('io').emit(`notification-${post.userId}`, {
                sender: userId,
                senderName: sender.name,  // ✅ Send sender name
                senderProfile: sender.profileImage,  // ✅ Send sender profile image
                type: "like",
                postId: postId,
                notificationId: notification._id
            });
        }

        res.status(201).json({ message: "Post liked successfully!", likes: post.likes.length });

    } catch (err) {
        console.error("🔥 Error adding like:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// ✅ Remove Like
const removeLike = async (req, res) => {
    try {
        const { userId, postId } = req.body;
        console.log("removereq", req.body)
        if (!userId || !postId) {
            return res.status(400).json({ message: "UserId and PostId are required." });
        }

        // ✅ Ensure post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        // ✅ Check if user actually liked the post before removing
        if (!post.likes.includes(userId)) {
            return res.status(400).json({ message: "You haven't liked this post." });
        }

        // ✅ Remove the like (filter out userId from likes array)
        post.likes = post.likes.filter(user => user._id.toString() !== userId);
        await post.save();

        console.log("✅ Like removed successfully!");
        res.status(200).json({ message: "Like removed successfully!", likes: post.likes.length });

    } catch (err) {
        console.error("🔥 Error removing like:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// ✅ Get Likes Count for a Post
const getLikesByPostId = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!postId) {
            return res.status(400).json({ message: "PostId is required." });
        }
        const checkpost = await Post.findById(postId);
        console.log("checkpost", checkpost)
        // const likes = await Like.find({ postId }).populate("userId", "username userimg");
        const post = await Post.findById(postId).populate('likes');
        console.log("likes", post.likes)
        res.status(200).json({ likesCount: post.likes.length, likes: post.likes });
    } catch (err) {
        console.error("Error fetching likes:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// ✅ Get Posts Liked by a User
const getUserLikedPosts = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "UserId is required." });
        }

        const likedPosts = await Like.find({ userId }).populate("postId");
        res.status(200).json({ likedPosts });
    } catch (err) {
        console.error("Error fetching liked posts:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { addLike, removeLike, getLikesByPostId, getUserLikedPosts };
