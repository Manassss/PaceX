const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile, getAllUsers, followUser, unfollowUser, searchbyname } = require("../controllers/userController");  // ✅ Make sure loginUser is imported

const router = express.Router();

router.post("/register", registerUser);  // Registration Route
router.post("/login", loginUser);        // ✅ Login Route

// ✅ Route to get user profile
router.get("/profile/:id", getUserProfile);

// ✅ Route to update user profile
router.put("/profile/:id", updateUserProfile);

// ✅ Route to get all users
router.get("/all", getAllUsers);
router.post('/:userId/follow/:targetUserId', followUser);
router.delete('/:userId/unfollow/:targetUserId', unfollowUser);
router.get('/search', searchbyname)


module.exports = router;