const router = require('express').Router();
const adminController = require('../controllers/adminController');

router.get('/users', adminController.getUsers);
router.get('/appointments', adminController.getAllAppointments);
router.get('/appointments-list', adminController.getAllAppointments);

module.exports = router;
