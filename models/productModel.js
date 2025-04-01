const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },  
  supplier: { type: String },
  dateAcquired: { type: Date },
});

module.exports = mongoose.model("Product", productSchema);
