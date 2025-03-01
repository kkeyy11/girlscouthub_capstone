const router = require('express').Router();
const userController = require('../controllers/userController');

router.get('/profile', userController.getProfile);

module.exports = router;
