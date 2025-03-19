const express = require('express');
const { createPost, getPosts, likePost, addComment, deletePost, togglearchive, toggletempdelete } = require('../controllers/postController');

const router = express.Router();

// Route to create a new post
router.post('/add', createPost);

// Route to fetch all posts (or filtered by query parameter)
router.get('/all', getPosts);

// NEW: Route to like a specific post
router.put('/like/:postId', likePost);

// NEW: Route to COMMENT a specific post

router.post('/addComment', addComment);
router.post('/delete/:postId', deletePost);
router.post('/archive', togglearchive);
router.post('/tempdelete/:postId', toggletempdelete);


module.exports = router;
