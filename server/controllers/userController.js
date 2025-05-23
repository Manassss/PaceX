const bcrypt = require("bcryptjs");
const User = require("../models/Userdetails");  // ✅ Importing the User model
const admin = require("../config/firebaseConfig"); // Import Firebase Admin
const Notification = require("../models/Notification"); // Import Notification model
const Comment = require('../models/Comment');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Like = require('../models/like');
const Chat = require('../models/Chat');

const Saved = require('../models/Saved');
const Marketplace = require('../models/Market');
const Story = require('../models/Story');
const CommunityPost = require('../models/CommunityPost');

const registerUser = async (req, res) => {
    try {
        const { idToken, name, email, role, profileImage, university, major, graduationYear, birthdate, bio, password, username } = req.body;

        // Verify Firebase ID Token
        console.log("email", email)
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const firebaseEmail = decodedToken.email;
        console.log("fbemail", firebaseEmail)

        // Check if email is verified
        // const firebaseUser = await admin.auth().getUser(decodedToken.uid);
        // if (!firebaseUser.emailVerified) {
        //     return res.status(400).json({ message: "❌ Email not verified. Please verify your email first." });
        // }

        let existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Save user details in MongoDB (no need to store password)
        const newUser = new User({
            name,
            password,
            email: firebaseEmail, // Use email from Firebase
            role: role || "student",
            profileImage: profileImage || "",
            university: university || "Pace University",
            major,
            graduationYear,
            birthdate,
            bio,
            username
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully!", userId: decodedToken.uid });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};
const loginUser = async (req, res) => {
    try {
        const { idToken } = req.body; // Frontend should send Firebase ID Token

        // Verify the token with Firebase
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const email = decodedToken.email;

        const firebaseUser = await admin.auth().getUser(decodedToken.uid);
        if (!firebaseUser.emailVerified) {
            return res
                .status(400)
                .json({ message: "❌ Email not verified. Please check your email." });
        }

        // Find user in MongoDB and populate follow lists
        const user = await User.findOne({ email })
            .populate("followings")
            .populate("followers");

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Build the payload with every field from your schema
        res.status(200).json({
            message: "Login successful!",
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                joinedAt: user.joinedAt,
                profileImage: user.profileImage,
                university: user.university,
                major: user.major,
                graduationYear: user.graduationYear,
                birthdate: user.birthdate,
                bio: user.bio,
                followings: user.followings,        // populated array
                followers: user.followers,         // populated array
                followingsNumber: user.followingsNumber,
                followersNumber: user.followersNumber,
                posts: user.posts,
                private: user.private,
                blockeduser: user.blockeduser,       // array of IDs
                blockedby: user.blockedby          // array of IDs
            }
        });

    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};


// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            console.log("User started")
            return res.status(404).json({ message: "User not found" });
        }
        console.log("quser.id");
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
    try {
        const { university, major, graduationYear, birthdate, bio, profileImage, username, private } = req.body;
        const { id } = req.params
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // ✅ Ensure profileImage is being updated
        if (profileImage) {
            user.profileImage = profileImage;
            console.log("profile url added", profileImage);
        }


        user.university = university || user.university;
        user.major = major || user.major;
        user.graduationYear = graduationYear || user.graduationYear;
        user.birthdate = birthdate || user.birthdate;
        user.bio = bio || user.bio;
        user.username = username || user.username;
        user.private = private || user.private;

        await user.save();
        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

const deleteCommentsBetweenUsers = async (userId, blockedUserId) => {
    try {
        await Comment.deleteMany({
            $or: [
                { userId: userId, post_userid: blockedUserId },
                { userId: blockedUserId, post_userid: userId }
            ]
        });
        console.log(`Comments between ${userId} and ${blockedUserId} deleted successfully`);
    } catch (error) {
        console.error("Error deleting comments between users:", error);
    }
};

// New API: Update the blockedBy property of a user
const updateBlock = async (req, res) => {
    try {
        console.log("block started")
        const { userId, blocked_userId } = req.body; // The ID of the user blocking

        const blockeduser = await User.findById(blocked_userId);
        const user = await User.findById(userId)
        if (!user || !blocked_userId) {
            return res.status(404).json({ message: "User not found" });
        }

        user.blockeduser.push(blocked_userId);
        blockeduser.blockedby.push(userId);

        const isFollowing = user.followings.includes(blocked_userId);
        const isFollower = user.followers.includes(blocked_userId);
        if (isFollowing) {
            user.followings.pull(blocked_userId);
            blockeduser.followers.pull(userId);
        }
        if (isFollower) {
            blockeduser.followings.pull(userId);
            user.followers.pull(blocked_userId);
        }
        user.followersNumber = user.followers.length
        user.followingsNumber = user.followings.length
        blockeduser.followingsNumber = blockeduser.followings.length
        blockeduser.followersNumber = blockeduser.followers.length
        await user.save();
        await blockeduser.save();
        await deleteCommentsBetweenUsers(userId, blocked_userId);

        res.status(200).json({ message: `Blocked ${blockeduser.name} successfully`, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
const unblock = async (req, res) => {
    try {
        console.log("unblock started")
        const { userId, blocked_userId } = req.body; // The ID of the user blocking

        const blockeduser = await User.findById(blocked_userId);
        const user = await User.findById(userId)
        if (!user || !blocked_userId) {
            return res.status(404).json({ message: "User not found" });
        }
        const isblocked = user.blockeduser.includes(blocked_userId)
        if (isblocked) {
            user.blockeduser.pull(blocked_userId);
            blockeduser.blockedby.pull(userId);
        }
        await user.save();
        await blockeduser.save();

        res.status(200).json({ message: `unBlocked ${blockeduser.name} successfully`, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
}

//  Get all users (for search)
const getAllUsers = async (req, res) => {
    try {
        // ✅ Fetch all users with all fields (excluding passwords for security)
        const users = await User.find().select("-password"); // Excludes password field
        res.status(200).json(users);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};


const toggleFollow = async (req, res) => {
    try {
        const { userId, targetUserId } = req.body;
        if (!userId || !targetUserId) {
            return res.status(400).json({ message: "User IDs are required" });
        }

        const user = await User.findById(userId); // ✅ Fetch the sender's details
        const targetUser = await User.findById(targetUserId);
        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = user.followings.includes(targetUserId);
        if (isFollowing) {
            user.followings.pull(targetUserId);
            targetUser.followers.pull(userId);
        } else {
            user.followings.push(targetUserId);
            targetUser.followers.push(userId);

            // ✅ Create Follow Notification and include sender details
            const notification = await Notification.create({
                userId: targetUserId,
                senderId: userId,
                senderName: user.name, // ✅ Store sender’s name in DB
                senderProfile: user.profileImage, // ✅ Store sender’s profile image in DB
                type: "follow",
            });

            console.log(`✅ Notification Created: ${user.name} followed ${targetUser.name}`);

            // ✅ Emit Real-Time Notification with sender details
            req.app.get('io').emit(`notification-${targetUserId}`, {
                sender: userId,
                senderName: user.name,  // ✅ Ensure sender name is included
                senderProfile: user.profileImage,  // ✅ Ensure profile image is included
                type: "follow",
                notificationId: notification._id
            });
        }

        await user.save();
        await targetUser.save();

        res.status(200).json({ message: isFollowing ? "Unfollowed" : "Followed" });
    } catch (error) {
        console.error("🔥 Error toggling follow:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



const searchbyname = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Search query is required" });
        }

        // Case-insensitive search using regex
        const users = await User.find({
            name: { $regex: query, $options: 'i' }
        }).select('_id name profileImage').limit(20); // Select only required fields

        res.json(users);
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const followrequest = async (req, res) => {
    const { targetUserId, requesterId } = req.body;

    try {
        console.log("follow request started", req.body);
        const targetUser = await User.findById(targetUserId);
        const requesterUser = await User.findById(requesterId);

        // ✅ Unfollow if already following
        const alreadyFollowing = targetUser.followers.includes(requesterId);
        if (alreadyFollowing) {
            targetUser.followers.pull(requesterId);
            requesterUser.followings.pull(targetUserId);

            targetUser.followersNumber = targetUser.followers.length;
            requesterUser.followingsNumber = requesterUser.followings.length;

            await targetUser.save();
            await requesterUser.save();

            return res.status(200).json({ message: "Unfollowed successfully." });
        }

        // 🟡 Handle follow request toggle
        const alreadyRequested = targetUser.requests.includes(requesterId);
        if (alreadyRequested) {
            targetUser.requests.pull(requesterId);
            await targetUser.save();
            return res.status(200).json({ message: "Request cancelled." });
        } else {
            targetUser.requests.push(requesterId);
            await targetUser.save();
            return res.status(200).json({ message: "Request sent." });
        }
    } catch (err) {
        console.error("Follow request error:", err);
        res.status(500).json({ error: err.message });
    }
};

const approvereject = async (req, res) => {
    const { targetUserId, requesterId, action } = req.body;
    console.log
    try {
        // Always remove request from list
        await User.findByIdAndUpdate(targetUserId, {
            $pull: { requests: requesterId }
        });

        if (action === "approve") {
            // Add to followers/followings
            await User.findByIdAndUpdate(targetUserId, {
                $addToSet: { followers: requesterId },
                $inc: { followersNumber: 1 }
            });

            await User.findByIdAndUpdate(requesterId, {
                $addToSet: { followings: targetUserId },
                $inc: { followingsNumber: 1 }
            });

            return res.status(200).json({ message: "Request approved." });
        } else {
            // Reject: do nothing else
            return res.status(200).json({ message: "Request rejected." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { userId, firebaseUid } = req.body
        console.log("rreeeq", req.body)
        console.log("delete started")
        // 1. Delete all posts by the user
        await Post.deleteMany({ userId });
        console.log("Posts deleted");
        // 2. Delete all comments made by user
        await Comment.deleteMany({ userId });
        console.log("Comments deleted");
        // 3. Remove user from other comments (e.g., their comments on other posts)
        await CommunityPost.updateMany(
            {},
            { $pull: { comments: { userId } } }
        );
        console.log("Community Posts deleted");
        // 4. Delete all likes by user
        await Like.deleteMany({ userId });
        console.log("Like deleted");
        // 5. Delete all chats/messages where user is sender or receiver
        await Chat.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });
        console.log("Chat deleted");

        // 6. Delete notifications triggered by or for user
        await Notification.deleteMany({ $or: [{ userId }, { senderId: userId }] });
        console.log("Notifications deleted");
        // 7. Delete user’s saved posts
        await Saved.deleteMany({ userId });
        console.log("Saved deleted");
        // 8. Delete user’s marketplace listings
        await Marketplace.deleteMany({ userId });
        console.log("Listings deleted");
        // 9. Delete user’s stories
        await Story.deleteMany({ userId });
        console.log("Stories deleted");
        // 10. Delete community posts
        // await CommunityPost.deleteMany({ userId });
        // console.log("Posts deleted");
        // 11. Remove user from followers/following of others
        await User.updateMany({}, {
            $pull: {
                followings: userId,
                followers: userId,
                blockedby: userId,
                blockeduser: userId,
                requests: userId
            }
        });

        // 12. Finally, delete the user document itself
        await User.findByIdAndDelete(userId);
        console.log("User deleted");
        // 13. Delete from Firebase Auth
        if (typeof firebaseUid !== 'string' || !firebaseUid.trim() || firebaseUid.length > 128) {
            throw new Error("❌ Invalid Firebase UID");
        }
        await admin.auth().deleteUser(firebaseUid);
        console.log("Firebase deleted");
        console.log("✅ User and all related data deleted successfully.");
        return res.status(200).json({ message: "User Deleted." });
    } catch (err) {
        console.error("❌ Error deleting user:", err);
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    toggleFollow,
    searchbyname,
    updateBlock, // ✅ New API for updating blockedBy
    unblock,
    followrequest,
    approvereject, deleteUser
};