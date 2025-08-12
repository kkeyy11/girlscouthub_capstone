const express = require('express');
const router = express.Router();
const districtController = require('../controllers/districtController');
const schoolController = require('../controllers/schoolController');
const troopController = require('../controllers/troopController');

// District Routes
router.get('/districts', districtController.getDistricts);
router.post('/districts/add', districtController.addDistrict);
router.get('/districts/:id', districtController.getDistrictSchools);
router.get('/districts/edit/:id', districtController.editDistrictForm);
router.post('/districts/edit/:id', districtController.updateDistrict);
router.post('/districts/delete/:id', districtController.deleteDistrict);


// School Routes
router.get('/add-school', (req, res) => {
  res.render('add-school', { districtId: req.query.districtId });
});
router.post('/schools/add', schoolController.addSchool);
router.get('/schools/:id', schoolController.getSchoolTroops);
router.get('/schools/edit/:id', schoolController.editSchoolForm);
router.post('/schools/edit/:id', schoolController.updateSchool);
router.post('/schools/delete/:id', schoolController.deleteSchool);


// Troop Routes
router.get('/addtroop', (req, res) => {
  res.render('addtroop', { schoolId: req.query.schoolId });
});
router.post('/troops/add', troopController.addTroop);
router.get('/troops/edit/:id', troopController.editTroopForm);
router.post('/troops/edit/:id', troopController.updateTroop);
router.post('/troops/delete/:id', troopController.deleteTroop);



module.exports = router;
