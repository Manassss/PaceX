const Marketplace = require("../models/Market");  // ✅ Ensure the file name matches exactly

// ✅ Add a New Marketplace Listing


// ✅ Add a New Marketplace Listing with Address Support
const addListing = async (req, res) => {
    try {
        const { userId, itemName, description, price, address, imageUrl } = req.body;

        if (!userId || !itemName || !description || !price || !address || !imageUrl) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        const newItem = new Marketplace({
            userId,
            itemName,
            description,
            price,
            address,     // ✅ Save full address

            imageUrl
        });

        await newItem.save();
        res.status(201).json({ message: "Marketplace item added successfully", item: newItem });

    } catch (error) {
        console.error("Error adding marketplace item:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Fetch All Marketplace Listings
const getListings = async (req, res) => {
    try {
        const listings = await Marketplace.find().populate("userId", "name email"); // Populate user info
        res.status(200).json(listings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { addListing, getListings };