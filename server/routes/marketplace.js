const express = require("express");
const { addListing, getListings } = require("../controllers/marketplaceController");
const router = express.Router();

router.post("/add", addListing);  // ✅ Route to add new marketplace listing
router.get("/all", getListings);  // ✅ Route to fetch all listings

module.exports = router;