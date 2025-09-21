const router = require('express').Router();
const adminController = require('../controllers/adminController');
const eventController = require('../controllers/eventController');

// ✅ Appointments
router.get('/appointments', adminController.getAllAppointments);
router.get('/appointments-list', adminController.getAllAppointments);
router.post('/appointments/update-status/:id/:status', adminController.updateAppointmentStatus);

// ✅ Events
router.get('/event', eventController.getEventForm);
router.post('/event', eventController.createEvent);

module.exports = router;
