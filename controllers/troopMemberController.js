const TroopMember = require('../models/troopMemberModel');
const District = require('../models/districtModel');

exports.showAddForm = async (req, res) => {
  const districts = await District.find();
  res.render('troopmember/add', { districts });
};

exports.createTroopMember = async (req, res) => {
  await TroopMember.create(req.body);
  res.redirect('/troopmembers');
};

exports.listTroopMembers = async (req, res) => {
  const members = await TroopMember.find().populate('district');
  const districts = await District.find();
  res.render('troopmember/list', { members, districts });
};

exports.deleteTroopMember = async (req, res) => {
  await TroopMember.findByIdAndDelete(req.params.id);
  res.redirect('/troopmembers');
};

exports.updateTroopMember = async (req, res) => {
  await TroopMember.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/troopmembers');
};

exports.getTroopMemberAPI = async (req, res) => {
  const member = await TroopMember.findById(req.params.id);
  res.json(member);
};
