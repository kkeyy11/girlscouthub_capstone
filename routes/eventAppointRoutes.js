const router = require('express').Router();
const adminController = require('../controllers/adminController');
const eventController = require('../controllers/eventController');
const upload = require('../middlewares/upload');

// ✅ Appointments
router.get('/appointments', adminController.getAllAppointments);
router.get('/appointments-list', adminController.getAllAppointments);
router.post('/appointments/update-status/:id/:status', adminController.updateAppointmentStatus);

// ✅ Events
router.get('/event', eventController.getEventForm);
router.post('/event', eventController.createEvent);
router.post('/event/:id', upload.single('image'), eventController.updateEvent);
router.post('/event/delete/:id', eventController.deleteEvent);

module.exports = router;
