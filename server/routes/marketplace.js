const express = require("express");
const { addListing, getListings, getbyid } = require("../controllers/marketplaceController");
const router = express.Router();

router.post("/add", addListing);  // ✅ Route to add new marketplace listing
router.get("/all", getListings);  // ✅ Route to fetch all listings
// router.get("/user/:userId", getUserListings);

module.exports = router;