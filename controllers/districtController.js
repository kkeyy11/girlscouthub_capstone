const mongoose = require('mongoose');
const District = require('../models/District');
const School = require('../models/School');

exports.getDistricts = async (req, res) => {
  try {
    // Aggregate para makuha schoolCount per district
    const districts = await District.aggregate([
      {
        $lookup: {
          from: 'schools',          // collection name ng School
          localField: '_id',        // District._id
          foreignField: 'district', // School.district
          as: 'schools'
        }
      },
      {
        $addFields: {
          schoolCount: { $size: '$schools' } // bilang ng schools
        }
      },
      {
        $project: {
          schools: 0 // wag na isama yung buong schools array, count lang kailangan
        }
      }
    ]);

    res.render('district', { districts });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
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

  // 🔒 Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(districtId)) {
    req.flash('error', 'Invalid district ID.');
    return res.redirect('/districts');
  }

  const district = await District.findById(districtId);
  const schools = await School.find({ district: district._id });

  res.render('district-schools', { district, schools });
};
