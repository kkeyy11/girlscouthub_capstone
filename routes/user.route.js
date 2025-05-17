const router = require('express').Router();
const userController = require('../controllers/userController');
const eventController = require('../controllers/eventController');
const productController = require("../controllers/productController");

router.get('/profile', userController.getProfile);
router.get('/appointments', userController.getAppointments);
router.post('/appointments', userController.addAppointment);
router.post('/appointments/delete/:id', userController.deleteAppointment);

router.get('/events', eventController.getEvents);
router.get('/eventList', eventController.getEventList);

router.post('/events/dismiss/:id', eventController.dismissNotification); // New dismiss route

router.get("/avail", productController.getAvailForm);
router.post("/avail", productController.processAvail);

module.exports = router;
