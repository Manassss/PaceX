const express = require("express");
const {
  addListing,
  getListings,
  getUserListings,
  deleteListing,
  updateListingStatus
} = require("../controllers/marketplaceController");

const router = express.Router();

router.post("/add",    addListing);
router.get("/all",     getListings);
router.get("/user/:userId", getUserListings);
router.delete("/:id", deleteListing);
router.patch("/:id/status", updateListingStatus);
module.exports = router;