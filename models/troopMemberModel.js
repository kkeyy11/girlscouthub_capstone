const mongoose = require('mongoose');

const troopMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  guardianName: { type: String, required: true },
  guardianContact: { type: String, required: true },
  troopNumber: { type: String, required: true },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
  school: { type: String, required: true }
});

module.exports = mongoose.model('TroopMember', troopMemberSchema);
