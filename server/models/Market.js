const mongoose = require("mongoose");

const marketplaceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    address: { type: String, required: true },
    category: { type: String, required: true },  // ✅ New Field
    subcategory: { type: String, required: true }, // ✅ New Field
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Marketplace", marketplaceSchema);
