const CommunityPost = require("../models/CommunityPost");
const Community = require("../models/Community");

//  Create a Community
const createCommunity = async (req, res) => {
    try {
        const { name, description, createdBy, coverImage, rules } = req.body;
        console.log("create started", req.body);
        // Create a new community based on the schema
        const newCommunity = new Community({
            name,
            description,
            coverImage: coverImage || "", // Default empty string if not provided
            rules: rules || [], // Default empty array if not provided
            members: [{ userId: createdBy, role: "admin" }], // Add creator as admin
            posts: 0, // Default post count
            createdBy
        });

        // Save community to the database
        await newCommunity.save();

        res.status(201).json({ message: "Community created successfully", community: newCommunity });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createCommunity };

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

// ✅ Toggle Membership (Add or Remove Member)
const toggleMembership = async (req, res) => {
    try {
        const { communityId } = req.body;
        const { userId } = req.body;

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community not found" });

        const memberIndex = community.members.findIndex(member => member.userId.toString() === userId);

        if (memberIndex !== -1) {
            // User is already a member, remove them
            community.members.splice(memberIndex, 1);
            await community.save();
            return res.json({ message: "Member removed successfully", community });
        } else {
            // User is not a member, add them
            community.members.push({ userId, role: "member" });
            await community.save();
            return res.json({ message: "Member added successfully", community });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ✅ Get All Communities
const getAllCommunities = async (req, res) => {
    try {
        const communities = await Community.find();
        res.json(communities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// ✅ Get a Community by ID
const getCommunityById = async (req, res) => {
    try {
        const { communityId } = req.params;
        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }
        res.json(community);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ✅ Delete a Community
const deleteCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;

        // Find the community
        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community not found" });

        // Delete all associated posts
        //   await CommunityPost.deleteMany({ communityId });

        // Delete the community
        await Community.findByIdAndDelete(communityId);

        res.json({ message: "Community deleted successfully" });
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

// Add the new function to module exports
module.exports = {
    createCommunity,
    editCommunity,
    toggleMembership,
    createPost,
    commentOnPost,
    likePost,
    deletePost,
    addComment,
    getAllCommunities,
    getCommunityById,
    deleteCommunity // ✅ Export the delete function
};