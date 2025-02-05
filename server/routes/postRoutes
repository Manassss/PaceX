const express = require('express');
const { createPost, getPosts } = require('../controllers/postController');

const router = express.Router();

// Route to create a new post
router.post('/add', createPost);

// Route to fetch all posts
router.get('/all', getPosts);

module.exports = router;