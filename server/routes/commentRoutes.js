const express = require("express");
const { deleteComment, editComment, addComment } = require("../controllers/commentController");
const router = express.Router();

router.post('/add', addComment);
router.put('/comment/:commentId', editComment);
router.delete('/comment/:commentId', deleteComment);

module.exports = router;