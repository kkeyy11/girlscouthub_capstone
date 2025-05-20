const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  quantity: Number,
  price: Number,
  supplier: String,
  dateAcquired: Date,
  image: String
});

module.exports = mongoose.model('Product', productSchema);
