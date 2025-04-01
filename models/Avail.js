const mongoose = require("mongoose");

const availSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Avail", availSchema);
