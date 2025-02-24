const bcrypt = require("bcryptjs");
const User = require("../models/Userdetails");  // ✅ Importing the User model
const admin = require("../config/firebaseConfig"); // Import Firebase Admin

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
            return res.status(400).json({ message: "❌ Email not verified. Please check your email." });
        }
        // Find user in MongoDB
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Debugging: Check what user object looks like
        console.log('User found:', user);

        // Ensure the response sends the user object
        res.status(200).json({
            message: "Login successful!",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                university: user.university,
                major: user.major,
                graduationYear: user.graduationYear,
                birthdate: user.birthdate,
                bio: user.bio
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
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
    try {
        const { university, major, graduationYear, birthdate, bio, profileImage, username } = req.body;

        const user = await User.findById(req.params.id);
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
        user.username = username || user.username

        await user.save();
        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

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

const followUser = async (req, res) => {
    try {
        const { userId, targetUserId } = req.params;

        if (userId === targetUserId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetUserId);

        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.followings.includes(targetUserId)) {
            return res.status(400).json({ message: "Already following this user" });
        }

        user.followings.push(targetUserId);
        targetUser.followers.push(userId);

        user.followingsNumber = user.followings.length;
        targetUser.followersNumber = targetUser.followers.length;

        await user.save();
        await targetUser.save();

        res.status(200).json({ message: "User followed successfully", user, targetUser });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
    try {
        const { userId, targetUserId } = req.params;

        if (userId === targetUserId) {
            return res.status(400).json({ message: "You cannot unfollow yourself" });
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetUserId);

        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.followings.includes(targetUserId)) {
            return res.status(400).json({ message: "You are not following this user" });
        }

        user.followings = user.followings.filter(id => id.toString() !== targetUserId);
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);

        user.followingsNumber = user.followings.length;
        targetUser.followersNumber = targetUser.followers.length;

        await user.save();
        await targetUser.save();

        res.status(200).json({ message: "User unfollowed successfully", user, targetUser });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
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
        }).select('_id name profileImage'); // Select only required fields

        res.json(users);
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, getAllUsers, followUser, unfollowUser, searchbyname };