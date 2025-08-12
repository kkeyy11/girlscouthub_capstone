const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  schoolId: { type: String, required: true },
  principal: { type: String, required: true },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' }
});

module.exports = mongoose.model('School', schoolSchema);
