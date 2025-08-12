const mongoose = require('mongoose');

const troopSchema = new mongoose.Schema({
  troopLeader: String,
  coLeader: String,
  troopNumber: String,
  ageLevel: String,
  barangayCommittee: String,
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }
});

module.exports = mongoose.model('Troop', troopSchema);
