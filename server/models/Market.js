const mongoose = require("mongoose");

const marketplaceSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  itemName:    { type: String, required: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  imageUrl:    { type: String, required: true },
  address:     { type: String, required: true },
  category:    { type: String, required: true },
  subcategory: { type: String, default: "" },
  sold:        { type: Boolean, default: false },    // ← new field
  createdAt:   { type: Date, default: Date.now },
  views:       { type: Number, default: 0 }
});

module.exports = mongoose.model("Marketplace", marketplaceSchema);