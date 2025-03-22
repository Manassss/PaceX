const Post = require('../models/Post');
const User = require('../models/Userdetails');
const Notification = require('../models/Notification')

const createPost = async (req, res) => {
  try {
    const { userId, userName, content, postimg, images } = req.body;
    console.log(postimg);
    const newPost = new Post({
      userId,
      userName,
      content,
      postimg,
      images
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

const getPosts = async (req, res) => {
  try {
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    const posts = await Post.find(filter).sort({ createdAt: -1 });

    // Ensure each post has `likes` and `dislikes` as an array
    const formattedPosts = posts.map(post => ({
      ...post._doc,  // ✅ Spread existing post data
      likes: Array.isArray(post.likes) ? post.likes : [], // ✅ Ensure `likes` is an array
      dislikes: Array.isArray(post.dislikes) ? post.dislikes : [], // ✅ Ensure `dislikes` is an array
    }));

    res.status(200).json(formattedPosts);
  } catch (err) {
    console.error('🔥 Error fetching posts:', err);
    res.status(500).json({ message: "Server Error" });
  }
};
const getuserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId: userId })

    res.status(200).json(posts);


  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ message: "Server Error" });
  }
}

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

const togglearchive = async (req, res) => {
  console.log("archive started");
  const { postId, userId } = req.body;
  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ message: "Post Not Found" })
  if (post.archived === true)
    post.archived = false;
  else
    post.archived = true;
  await post.save();
  res.status(201).json({ message: "Post Archived successfully!", post: post });
}

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

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    console.log("del started");
    // Find the post
    const post = await Post.findById(postId);
    console.log("pos", post);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Remove the post
    await Post.findByIdAndDelete(postId);

    // Decrease post count for the user
    await User.findByIdAndUpdate(post.userId, { $inc: { posts: -1 } });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const toggletempdelete = async (req, res) => {
  try {
    const { postId } = req.params;
    console.log("Temp delete started");

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Toggle temp delete status
    if (post.tempdelete === false) {
      post.tempdelete = true;
      post.deletetimestamp = Date.now();
    } else {
      post.tempdelete = false;
      post.deletetimestamp = null;
    }

    // Save the changes
    await post.save();

    // Send response back to client
    res.status(200).json({
      message: post.tempdelete ? "Post marked for temporary deletion" : "Post restored from temporary deletion",
      post
    });

  } catch (err) {
    console.error("Error toggling temporary delete:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getuserfeed = async (req, res) => {

  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "user not found" });
    const followings = user.followings;
    const posts = await Post.find({ userId: { $in: [userId, ...followings] } }).sort({ createdAt: -1 });

    res.status(200).json(posts);


  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ message: "Server Error" });
  }


}

module.exports = { createPost, getPosts, likePost, addComment, deletePost, togglearchive, toggletempdelete, getuserfeed, getuserPosts };
