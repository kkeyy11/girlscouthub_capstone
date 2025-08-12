const School = require('../models/School');
const Troop = require('../models/Troop');

exports.addSchool = async (req, res) => {
  const { name, schoolId, principal, districtId } = req.body;
  await School.create({ name, schoolId, principal, district: districtId });
  res.redirect(`/districts/${districtId}`);
};

exports.getSchoolTroops = async (req, res) => {
  const school = await School.findById(req.params.id);
  const troops = await Troop.find({ school: school._id });
  res.render('school-troops', { school, troops });
};

exports.editSchoolForm = async (req, res) => {
  const school = await School.findById(req.params.id);
  res.render('edit-school', { school });
};

exports.updateSchool = async (req, res) => {
  const { name, schoolId, principal } = req.body;

  // ✅ Update school and then fetch it back to get district ID
  await School.findByIdAndUpdate(req.params.id, {
    name,
    schoolId,
    principal
  });

  const updatedSchool = await School.findById(req.params.id);
  res.redirect(`/districts/${updatedSchool.district}`);
};


exports.deleteSchool = async (req, res) => {
  const school = await School.findById(req.params.id);
  const districtId = req.body.districtId;
  await School.findByIdAndDelete(req.params.id);
  res.redirect(`/districts/${districtId}`);
};

