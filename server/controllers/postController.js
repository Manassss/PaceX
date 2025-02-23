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

// GET all posts, optionally filtering by userId query parameter
const getPosts = async (req, res) => {
  try {
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    const posts = await Post.find(filter).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: "Server Error" });
  }
};

//  Like a specific post
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    // Increment the like count for this post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error liking post:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { createPost, getPosts, likePost };
