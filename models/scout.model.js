const mongoose = require('mongoose');

const scoutSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true }
});

module.exports = mongoose.model('Scout', scoutSchema);
