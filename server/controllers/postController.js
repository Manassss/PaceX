const Post = require('../models/Post');
const User = require('../models/Userdetails');
const Notification = require('../models/Notification')

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
    const user = await User.findById(userId);
    user.posts = (user.posts || 0) + 1; // Ensure posts field exists, then increment
    await user.save()
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
  const { postId, userId } = req.body;
  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  if (!post.likes.includes(userId)) {
    post.likes.push(userId);
    await post.save();

    // 🔔 Create Notification for Post Owner
    const notification = new Notification({
      recipient: post.userId, sender: userId, type: "like", postId
    });
    await notification.save();
  }
  res.json(post);
};


const addComment = async (req, res) => {
  try {
    const { postId, userId, text } = req.body;

    if (!postId || !userId || !text) {
      return res.status(400).json({ message: "postId, userId, and text are required." });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Create a new comment object
    const newComment = {
      userId,
      text,
      createdAt: new Date(),
      postId
    };

    // Add comment to post
    post.comments.push(newComment);

    // Save the updated post
    await post.save();
    const notification = new Notification({
      recipient: post.userId, sender: userId, type: "comment", postId
    });
    await notification.save();


    res.status(201).json({ message: "Comment added successfully!", post });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports = { createPost, getPosts, likePost, addComment };
