const Scout = require('../models/scout.model');
const School = require('../models/school.model');

exports.createScout = async (req, res, next) => {
  const { firstName, lastName, age, schoolId } = req.body;
  try {
    const newScout = new Scout({ firstName, lastName, age, school: schoolId });
    await newScout.save();
    req.flash('success', 'Scout added successfully!');
    res.redirect('/admin/scouts/' + schoolId);
  } catch (error) {
    next(error);
  }
};

exports.getScouts = async (req, res, next) => {
  const { schoolId } = req.params;
  try {
    const scouts = await Scout.find({ school: schoolId });
    const school = await School.findById(schoolId);
    res.render('scouts', { scouts, school });
  } catch (error) {
    next(error);
  }
};

exports.updateScout = async (req, res, next) => {
  const { scoutId, firstName, lastName, age, schoolId } = req.body;
  try {
    await Scout.findByIdAndUpdate(scoutId, { firstName, lastName, age, school: schoolId });
    req.flash('success', 'Scout updated successfully!');
    res.redirect('/admin/scouts/' + schoolId);
  } catch (error) {
    next(error);
  }
};

exports.deleteScout = async (req, res, next) => {
  const { scoutId } = req.params;
  try {
    await Scout.findByIdAndDelete(scoutId);
    req.flash('success', 'Scout deleted successfully!');
    res.redirect('/admin/scouts');
  } catch (error) {
    next(error);
  }
};
