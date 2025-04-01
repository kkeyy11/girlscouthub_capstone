const School = require('../models/school.model');
const District = require('../models/district.model');

exports.createSchool = async (req, res, next) => {
  const { name, districtId } = req.body;
  try {
    const newSchool = new School({ name, district: districtId });
    await newSchool.save();
    req.flash('success', 'School added successfully!');
    res.redirect('/admin/schools/' + districtId);
  } catch (error) {
    next(error);
  }
};

exports.getSchools = async (req, res, next) => {
  const { districtId } = req.params;
  try {
    const schools = await School.find({ district: districtId });
    const district = await District.findById(districtId);
    res.render('schools', { schools, district });
  } catch (error) {
    next(error);
  }
};

exports.updateSchool = async (req, res, next) => {
  const { schoolId, name, districtId } = req.body;
  try {
    await School.findByIdAndUpdate(schoolId, { name, district: districtId });
    req.flash('success', 'School updated successfully!');
    res.redirect('/admin/schools/' + districtId);
  } catch (error) {
    next(error);
  }
};

exports.deleteSchool = async (req, res, next) => {
  const { schoolId } = req.params;
  try {
    await School.findByIdAndDelete(schoolId);
    req.flash('success', 'School deleted successfully!');
    res.redirect('/admin/schools');
  } catch (error) {
    next(error);
  }
};
