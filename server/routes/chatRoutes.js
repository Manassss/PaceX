const express = require("express");
const { sendMessage, getChatHistory, getdefaultUsers } = require("../controllers/chatController");
const router = express.Router();

router.post("/send", sendMessage);  // Route to add new marketplace listing
router.get("/get", getChatHistory);  //  Route to fetch all listings
router.get('/getusers/:userId', getdefaultUsers);

module.exports = router;