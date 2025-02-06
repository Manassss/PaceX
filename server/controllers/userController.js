const bcrypt = require("bcryptjs");
const User = require("../models/Userdetails");  // ✅ Importing the User model

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }



        user = new User({
            name,
            email,
            password,
        });

        await user.save();
        res.status(201).json({ message: "User registered successfully!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
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
                email: user.email
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
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
        const { university, major, graduationYear, birthdate, bio, profileImage } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the profile fields
        user.university = university || user.university;
        user.major = major || user.major;
        user.graduationYear = graduationYear || user.graduationYear;
        user.birthdate = birthdate || user.birthdate;
        user.bio = bio || user.bio;
        user.profileImage = profileImage || user.profileImage;

        await user.save();
        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// ✅ Get all users (for search)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'name university major');  // Only return necessary fields
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, getAllUsers };