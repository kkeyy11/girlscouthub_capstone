const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },

  // ✅ NEW
  image: { type: String }, // stores filename only

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
