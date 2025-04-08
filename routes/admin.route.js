const router = require('express').Router();
const adminController = require('../controllers/adminController');
const districtController = require('../controllers/districtController');
const schoolController = require('../controllers/schoolController');
const scoutController = require('../controllers/scoutController');
const eventController = require('../controllers/eventController');
const productController = require("../controllers/productController");

// Show Add Product Form
router.get("/add", productController.showAddProductForm);
router.post("/add", productController.addProduct);

// Show All Products
router.get("/", productController.getAllProducts);

// Show Edit Product Form
router.get("/edit/:id", productController.showEditForm);
router.post("/edit/:id", productController.updateProduct);

// Delete Product
router.post("/delete/:id", productController.deleteProduct);

// Show Add Stocks Form
router.post("/add-stocks/:id", productController.addStocks);


// Low Stock Alert Route
router.get("/low-stock", productController.getLowStockProducts);


router.get("/report", productController.getReport);

router.get("/avail", productController.getAvailForm);
router.post("/avail", productController.processAvail);


// View all users and appointments
router.get('/users', adminController.getUsers);
router.get('/appointments', adminController.getAllAppointments);
router.get('/appointments-list', adminController.getAllAppointments);

// // Inventory routes
// router.get('/inventory', adminController.getInventory);
// router.post('/inventory/create', adminController.createInventory);  // Handle creating inventory
// router.post('/inventory/update', adminController.updateInventory);  // Handle updating inventory
// router.get('/inventory/delete/:itemId', adminController.deleteInventory);  // Handle deleting inventory item

//event
router.get('/event', eventController.getEventForm);
router.post('/event', eventController.createEvent);





// District routes
//router.get('/districts', districtController.getDistricts); // Route for displaying districts
//router.get('/district/create', districtController.showCreateDistrictForm); // Route to show create district form

//router.post('/district/create', districtController.createDistrict); // Route to handle create district POST request

// Route for updating districts
//router.get('/district/edit/:districtId', districtController.showEditDistrictForm); // Route to show edit form
//router.post('/district/update', districtController.updateDistrict); // Route for updating the district

// Route for deleting district
//router.post('/district/delete/:districtId', districtController.deleteDistrict);


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
