const express = require("express");
const { addLike, removeLike, getLikesByPostId, getUserLikedPosts } = require("../controllers/likeController");
const router = express.Router();

router.post('/add', addLike);              // ✅ Like a post
router.post('/remove', removeLike);
router.get('/post/:postId', getLikesByPostId);  // ✅ Get likes for a post
router.get('/user/:userId', getUserLikedPosts); // ✅ Get liked posts by a user

module.exports = router;
