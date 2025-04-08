const express = require('express');
const router = express.Router();
const districtController = require('../controllers/districtController');

router.get('/add', districtController.showAddForm);
router.post('/add', districtController.createDistrict);
router.get('/', districtController.listDistricts); // optional list page
router.post('/delete/:id', districtController.deleteDistrict); // delete route

router.get('/:id/members', districtController.viewDistrictMembers);
// Route to get all districts for dropdown
router.get('/all', districtController.getAllDistricts); // Use the controller function here

// Route: show all troop members in this district
//router.get('/:id/members', async (req, res) => {
//    const district = await District.findById(req.params.id);
//    const members = await TroopMember.find({ district: req.params.id }).populate('district');
 //   res.render('district/members', { district, members });
 // });

module.exports = router;
