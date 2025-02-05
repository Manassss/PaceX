const express = require("express");
const { registerUser, loginUser } = require("../controllers/userController");  // ✅ Make sure loginUser is imported

const router = express.Router();

router.post("/register", registerUser);  // Registration Route
router.post("/login", loginUser);        // ✅ Login Route

module.exports = router;