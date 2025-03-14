const router = require('express').Router();
const userController = require('../controllers/userController');

router.get('/profile', userController.getProfile);
router.get('/appointments', userController.getAppointments);
router.post('/appointments', userController.addAppointment);
router.post('/appointments/delete/:id', userController.deleteAppointment);

module.exports = router;
