const express = require("express");
const { deleteComment, editComment, addComment, getCommentsByPostId } = require("../controllers/commentController");
const router = express.Router();

router.post('/add', addComment);
router.put('/edit/:commentId', editComment);
router.delete('/del/:commentId', deleteComment);
router.get('/:postId', getCommentsByPostId);

module.exports = router;