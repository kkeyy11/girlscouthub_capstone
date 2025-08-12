const mongoose = require('mongoose');
const District = require('../models/District');
const School = require('../models/School');

exports.getDistricts = async (req, res) => {
  const districts = await District.find();
  res.render('district', { districts });
};

exports.addDistrict = async (req, res) => {
  await District.create({ name: req.body.name });
  res.redirect('/districts');
};

exports.editDistrictForm = async (req, res) => {
  const district = await District.findById(req.params.id);
  res.render('edit-district', { district });
};

exports.updateDistrict = async (req, res) => {
  await District.findByIdAndUpdate(req.params.id, { name: req.body.name });
  res.redirect('/districts');
};

exports.deleteDistrict = async (req, res) => {
  await District.findByIdAndDelete(req.params.id);
  res.redirect('/districts');
};

exports.getDistrictSchools = async (req, res) => {
  const districtId = req.params.id;

  // 🔒 Protect against invalid ObjectId (e.g., "all")
  if (!mongoose.Types.ObjectId.isValid(districtId)) {
    req.flash('error', 'Invalid district ID.');
    return res.redirect('/districts');
  }

  const district = await District.findById(districtId);
  const schools = await School.find({ district: district._id });

  res.render('district-schools', { district, schools });
};
