const Post = require('../models/Post');

const createPost = async (req, res) => {
    try {
        const { userId, userName, content, postimg } = req.body;
        console.log(postimg);
        const newPost = new Post({
            userId,
            userName,
            content,
            postimg
        });

        await newPost.save();
        res.status(201).json({ message: "Post created successfully!", post: newPost });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// GET all posts
const getPosts = async (req, res) => {
    try {
        console.log('Fetching posts...');  // Log when request hits the server

        const posts = await Post.find().sort({ createdAt: -1 });  // Fetch posts sorted by latest

        console.log('Posts fetched:', posts);  // Log the fetched posts
        res.status(200).json(posts);
    } catch (err) {
        console.error('Error fetching posts:', err);  // Detailed error logging
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { createPost, getPosts };