const router = require('express').Router();
const adminController = require('../controllers/adminController');
const districtController = require('../controllers/districtController');
const schoolController = require('../controllers/schoolController');
const scoutController = require('../controllers/scoutController');

// View all users and appointments
router.get('/users', adminController.getUsers);
router.get('/appointments', adminController.getAllAppointments);
router.get('/appointments-list', adminController.getAllAppointments);

// Inventory routes
router.get('/inventory', adminController.getInventory);
router.post('/inventory/create', adminController.createInventory);  // Handle creating inventory
router.post('/inventory/update', adminController.updateInventory);  // Handle updating inventory
router.get('/inventory/delete/:itemId', adminController.deleteInventory);  // Handle deleting inventory item






// District routes
router.get('/districts', districtController.getDistricts);
router.get('/district/create', districtController.showCreateDistrictForm);

router.post('/district/create', districtController.createDistrict);

// Route for updating districts
router.get('/district/edit/:districtId', districtController.showEditDistrictForm);
router.post('/district/update', districtController.updateDistrict);



router.get('/district/delete/:districtId', districtController.deleteDistrict);

// School routes
router.get('/schools/:districtId', schoolController.getSchools);
router.post('/school/create', schoolController.createSchool);
router.post('/school/update', schoolController.updateSchool);
router.get('/school/delete/:schoolId', schoolController.deleteSchool);

// Scout routes
router.get('/scouts/:schoolId', scoutController.getScouts);
router.post('/scout/create', scoutController.createScout);
router.post('/scout/update', scoutController.updateScout);
router.get('/scout/delete/:scoutId', scoutController.deleteScout);

module.exports = router;
