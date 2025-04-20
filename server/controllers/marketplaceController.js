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

// DELETE /api/marketplace/:id
const deleteListing = async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Marketplace.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ message: "Listing not found" });
      res.status(200).json({ message: "Listing deleted successfully" });
    } catch (error) {
      console.error("🔥 Error deleting listing:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  // body: { sold: true } or { sold: false }
  const updateListingStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { sold } = req.body;
      if (typeof sold !== "boolean") {
        return res.status(400).json({ message: "`sold` must be a boolean" });
      }
  
      const listing = await Marketplace.findByIdAndUpdate(
        id,
        { sold },
        { new: true }
      );
      if (!listing) return res.status(404).json({ message: "Listing not found" });
  
      res.status(200).json({ message: "Status updated", item: listing });
    } catch (error) {
      console.error("🔥 Error updating status:", error);
      res.status(500).json({ message: "Server error" });
    }
  };





module.exports = { addListing, getListings, getUserListings, updateListingStatus, deleteListing   };
