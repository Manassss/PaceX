const express = require('express');
const { createPost, getPosts, likePost, addComment, deletePost,
    togglearchive, toggletempdelete, toggleSavedPost,
    getuserfeed, getuserPosts, getRandomPosts } = require('../controllers/postController');

const router = express.Router();


//  Route to create a new post
router.post('/add', createPost);

//  Route to fetch all posts (or filtered by query parameter)
router.get('/all', getPosts);

//  Feed route should be placed before `/:userId` to avoid conflicts
router.get('/feed/:userId', getuserfeed);

//  Route to fetch a specific user's posts (must be AFTER '/feed/:userId')
router.get('/:userId', getuserPosts);

//  Route to like a specific post
router.put('/like/:postId', likePost);

//  Route to add a comment to a post
router.post('/addComment', addComment);

//  Route to archive a post
router.post('/archive', togglearchive);

//  Route to temporarily delete a post
router.post('/tempdelete/:postId', toggletempdelete);

//  Route to delete a post permanently (should be after other post actions)
router.post('/delete/:postId', deletePost);

router.post('/save', toggleSavedPost);

router.post('/random', getRandomPosts)


module.exports = router;
