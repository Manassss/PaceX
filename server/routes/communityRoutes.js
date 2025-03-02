const express = require("express");
const router = express.Router();
const communityController = require("../controllers/CommunityController");


router.post("/create", communityController.createCommunity);
router.put("/:communityId/edit", communityController.editCommunity);
router.post("/:communityId/add-member", communityController.addMember);
router.delete("/:communityId/remove-member/:userId", communityController.removeMember);


router.post("/:communityId/post", communityController.createPost);
router.post("/:postId/comment", communityController.commentOnPost);
router.post("/:postId/like", communityController.likePost);
router.delete("/:postId", communityController.deletePost);


module.exports = router;