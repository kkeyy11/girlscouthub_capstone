// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   name: String,
//   category: String,
//   description: String,
//   quantity: Number,
//   price: Number,
//   supplier: String,
//   dateAcquired: Date,
//   image: String
// });

// module.exports = mongoose.model('Product', productSchema);



const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  subcategory: String, // 🆕 Added subcategory
  variant: String,     // 🆕 Added variant (e.g., S, M, L, XL)
  description: String,
  quantity: Number,
  price: Number,
  supplier: String,
  dateAcquired: Date
});

module.exports = mongoose.model('Product', productSchema);
