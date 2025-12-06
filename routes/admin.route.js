const router = require('express').Router();
const adminController = require('../controllers/adminController');

const eventController = require('../controllers/eventController');
const productController = require("../controllers/productController");
const dashboardController = require("../controllers/dashboardController");


router.get("/dashboard", dashboardController.getIndex);




// View all users and appointments
router.get('/users', adminController.getUsers);
router.get('/appointments', adminController.getAllAppointments);
router.get('/appointments-list', adminController.getAllAppointments);
// Admin route to update appointment status
router.post('/appointments/update-status/:id/:status', adminController.updateAppointmentStatus);




//event
router.get('/event', eventController.getEventForm);
router.post('/event', eventController.createEvent);







module.exports = router;
