const CommunityPost = require("../models/CommunityPost");
const Community = require("../models/Community");

//  Create a Community
const createCommunity = async (req, res) => {
    try {
        const { name, description, category, university, createdBy } = req.body;
        const newCommunity = new Community({
            name, description, category, university, createdBy,
            members: [{ userId: createdBy, role: "admin" }]
        });
        await newCommunity.save();
        res.status(201).json({ message: "Community created successfully", community: newCommunity });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//  Edit Community Details
const editCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;
        const updatedCommunity = await Community.findByIdAndUpdate(communityId, req.body, { new: true });
        res.json(updatedCommunity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//  Add a Member to Community
const addMember = async (req, res) => {
    try {
        const { communityId } = req.params;
        const { userId } = req.body;
        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community not found" });

        community.members.push({ userId, role: "member" });
        await community.save();
        res.json({ message: "Member added successfully", community });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//  Remove a Member from Community
const removeMember = async (req, res) => {
    try {
        const { communityId, userId } = req.params;
        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community not found" });

        community.members = community.members.filter(member => member.userId.toString() !== userId);
        await community.save();
        res.json({ message: "Member removed successfully", community });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// ✅ Add a Community Post
const createPost = async (req, res) => {
    try {
        const { communityId } = req.params;
        const { userId, content, image } = req.body;

        const post = new CommunityPost({ communityId, userId, content, image });
        await post.save();

        await Community.findByIdAndUpdate(communityId, { $push: { posts: post._id } });

        res.status(201).json({ message: "Post created successfully", post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Comment on a Community Post
const commentOnPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, text } = req.body;

        const post = await CommunityPost.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.comments.push({ userId, text });
        await post.save();

        res.json({ message: "Comment added successfully", post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Like or Unlike a Community Post
const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        const post = await CommunityPost.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (!post.likes.includes(userId)) {
            post.likes.push(userId);
        } else {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        }

        await post.save();
        res.json({ message: "Post like updated", post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete a Community Post
const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await CommunityPost.findByIdAndDelete(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        await Community.findByIdAndUpdate(post.communityId, { $pull: { posts: postId } });

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, text } = req.body;

        // Find the post
        const post = await CommunityPost.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Add the comment
        const newComment = { userId, text, createdAt: new Date() };
        post.comments.push(newComment);

        await post.save();

        res.json({ message: "Comment added successfully", post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createCommunity, editCommunity, addMember, removeMember, createPost, commentOnPost, likePost, deletePost, addComment };