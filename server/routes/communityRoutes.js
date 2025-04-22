const express = require("express");
const router = express.Router();
const communityController = require("../controllers/CommunityController");

router.get("/", communityController.getAllCommunities)
router.post("/", communityController.createCommunity);
router.get("/:communityId", communityController.getCommunityById);
router.put("/:communityId/edit", communityController.editCommunity);
router.post("/togglemember", communityController.toggleMembership);
router.delete("/:communityId", communityController.deleteCommunity);
router.get("/user/:userId", communityController.getUserCommunities);


router.post("/post", communityController.createPost);
router.get("/post/:communityId", communityController.getCommunityPosts);
router.post("/:postId/comment", communityController.commentOnPost);
router.post("/:postId/like", communityController.likePost);
router.delete("/:postId", communityController.deletePost);


module.exports = router;