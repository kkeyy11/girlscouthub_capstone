// const District = require('../models/district.model');

// exports.createDistrict = async (req, res, next) => {
//     const { name, description } = req.body;
//     try {
//         const newDistrict = new District({ name, description });
//         await newDistrict.save();
//         req.flash('success', 'District added successfully!');
//         res.redirect('/admin/districts');
//     } catch (error) {
//         next(error);
//     }
// };

// exports.getDistricts = async (req, res, next) => {
//     try {
//         const districts = await District.find();
//         res.render('districts', { districts });
//     } catch (error) {
//         next(error);
//     }
// };

// exports.showCreateDistrictForm = (req, res) => {
//     res.render('district-create'); // Ensure 'district-create.ejs' exists inside the 'views' folder
// };

// exports.showEditDistrictForm = async (req, res, next) => {
//     const { districtId } = req.params;
//     try {
//         const district = await District.findById(districtId);
//         if (!district) {
//             req.flash('error', 'District not found');
//             return res.redirect('/admin/districts');
//         }
//         res.render('district-edit', { district }); // Pass the district data to the view
//     } catch (error) {
//         next(error);
//     }
// };

// exports.updateDistrict = async (req, res, next) => {
//     const { districtId, name, description } = req.body;
//     try {
//         await District.findByIdAndUpdate(districtId, { name, description });
//         req.flash('success', 'District updated successfully!');
//         res.redirect('/admin/districts');
//     } catch (error) {
//         next(error);
//     }
// };

// exports.deleteDistrict = async (req, res, next) => {
//     const { districtId } = req.params;
//     try {
//         await District.findByIdAndDelete(districtId);
//         req.flash('success', 'District deleted successfully!');
//         res.redirect('/admin/districts');
//     } catch (error) {
//         next(error);
//     }
// };

const District = require('../models/districtModel');
const TroopMember = require('../models/troopMemberModel');

// Show form
exports.showAddForm = (req, res) => {
  res.render('district/add');
};

// Handle form submission
exports.createDistrict = async (req, res) => {
  try {
    const { name } = req.body;
    const district = new District({ name });
    await district.save();
    res.redirect('/districts');
  } catch (err) {
    res.status(500).send('Error saving district');
  }
};

// Optional: List districts
exports.listDistricts = async (req, res) => {
  const districts = await District.find();
  res.render('district/list', { districts });
};

exports.listDistricts = async (req, res) => {
    try {
      const districts = await District.find();
      res.render('district/list', { districts });
    } catch (err) {
      res.status(500).send('Error fetching districts');
    }
  };
  
  // Delete district
  exports.deleteDistrict = async (req, res) => {
    try {
      await District.findByIdAndDelete(req.params.id);
      res.redirect('/districts');
    } catch (err) {
      res.status(500).send('Error deleting district');
    }
  };

  
  // Show all members in a specific district
exports.viewDistrictMembers = async (req, res) => {
    try {
      const district = await District.findById(req.params.id); // Find district by ID
      if (!district) {
        return res.status(404).send("District not found");
      }
  
      // Find all members with the specific district
      const members = await TroopMember.find({ district: req.params.id }).populate('district');
      
      // Render the members page for the district
      res.render('district/members', { district, members });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  };

  // Function to fetch all districts
exports.getAllDistricts = async (req, res) => {
    try {
      const districts = await District.find(); // Get all districts
      res.json(districts); // Send the districts as JSON
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching districts");
    }
  };