const Marketplace = require("../models/Market");  // ✅ Ensure the file name matches exactly

// ✅ Add a New Marketplace Listing


// ✅ Add a New Marketplace Listing with Address Support
const addListing = async (req, res) => {
    try {
        console.log("🔍 Received Data:", req.body); // ✅ Debugging

        const { userId, itemName, description, price, address, imageUrl, category, subcategory } = req.body;

        // ✅ Remove 'subcategory' from required fields
        if (!userId || !itemName || !description || !price || !address || !imageUrl || !category) {
            console.error("❌ Missing Fields:", { userId, itemName, description, price, address, imageUrl, category, subcategory });
            return res.status(400).json({ message: "All fields are required!" });
        }

        const newItem = new Marketplace({
            userId,
            itemName,
            description,
            price,
            address,
            imageUrl,
            category,
            subcategory: subcategory || "", // ✅ Store an empty string if missing
        });

        await newItem.save();
        res.status(201).json({ message: "Marketplace item added successfully", item: newItem });

    } catch (error) {
        console.error("🔥 Error adding marketplace item:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// ✅ Modify Fetch Listings to Support Category Filtering
const getListings = async (req, res) => {
    try {
        const { category } = req.query;
        let query = category ? { category } : {};

        // ✅ Fetch name, email, profileImage, and other details from the User model
        const listings = await Marketplace.find(query)
            .populate("userId", "name email profileImage bio location") // ✅ Now includes profile data
            .sort({ createdAt: -1 }); // ✅ Sort by latest listings first

        res.status(200).json(listings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

const getUserListings = async (req, res) => {
    try {
        const { userId } = req.params;
        const listings = await Marketplace.find({ userId });
        res.status(200).json(listings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};






module.exports = { addListing, getListings, getUserListings  };
