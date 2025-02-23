const express = require('express');
const { createPost, getPosts, likePost } = require('../controllers/postController');

const router = express.Router();

// Route to create a new post
router.post('/add', createPost);

// Route to fetch all posts (or filtered by query parameter)
router.get('/all', getPosts);

// NEW: Route to like a specific post
router.put('/like/:postId', likePost);

module.exports = router;
