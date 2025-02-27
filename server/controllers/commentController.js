const Comment = require('../models/Comment');

const addComment = async (req, res) => {
    try {
        const { userId, postId, text } = req.body;

        if (!userId || !postId || !text) {
            return res.status(400).json({ message: "userId, postId, and text are required." });
        }

        const newComment = new Comment({ userId, postId, text });

        await newComment.save();

        res.status(201).json({ message: "Comment added successfully!", comment: newComment });
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

const editComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Text is required to update a comment." });
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { text },
            { new: true } // Return updated document
        );

        if (!updatedComment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        res.status(200).json({ message: "Comment updated successfully!", comment: updatedComment });
    } catch (err) {
        console.error("Error updating comment:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const deletedComment = await Comment.findByIdAndDelete(commentId);

        if (!deletedComment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        res.status(200).json({ message: "Comment deleted successfully!" });
    } catch (err) {
        console.error("Error deleting comment:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { deleteComment, editComment, addComment };