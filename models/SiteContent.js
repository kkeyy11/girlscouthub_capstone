// models/SiteContent.js
const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  filename: { type: String, required: true },
  caption: { type: String }
});

const siteContentSchema = new mongoose.Schema({
  bannerImage: { type: String, default: null },
  gallery: [gallerySchema]
});

module.exports = mongoose.model('SiteContent', siteContentSchema);
