const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true }
});

module.exports = mongoose.model('District', districtSchema);
