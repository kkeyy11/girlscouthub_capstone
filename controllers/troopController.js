const Troop = require('../models/Troop');

exports.addTroop = async (req, res) => {
  const { troopLeader, coLeader, troopNumber, ageLevel, barangayCommittee, schoolId } = req.body;
  await Troop.create({ troopLeader, coLeader, troopNumber, ageLevel, barangayCommittee, school: schoolId });
  res.redirect(`/schools/${schoolId}`);
};

exports.editTroopForm = async (req, res) => {
  const troop = await Troop.findById(req.params.id);
  res.render('edit-troop', { troop });
};

exports.updateTroop = async (req, res) => {
  const { troopLeader, coLeader, troopNumber, ageLevel, barangayCommittee } = req.body;
  const troop = await Troop.findByIdAndUpdate(req.params.id, {
    troopLeader,
    coLeader,
    troopNumber,
    ageLevel,
    barangayCommittee
  });
  res.redirect(`/schools/${troop.school}`);
};

exports.deleteTroop = async (req, res) => {
  const troop = await Troop.findById(req.params.id);
  const schoolId = req.body.schoolId;
  await Troop.findByIdAndDelete(req.params.id);
  res.redirect(`/schools/${schoolId}`);
};
