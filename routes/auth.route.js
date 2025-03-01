const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const connectEnsure = require('connect-ensure-login');

router.get('/login', connectEnsure.ensureLoggedOut({ redirectTo: '/' }), authController.getLogin);
router.post('/login', connectEnsure.ensureLoggedOut({ redirectTo: '/' }), authController.postLogin);

router.get('/register', connectEnsure.ensureLoggedOut({ redirectTo: '/' }), authController.getRegister);

router.post('/register', connectEnsure.ensureLoggedOut({ redirectTo: '/' }), [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email must be a valid email')
        .normalizeEmail()
        .toLowerCase(),

    body('password')
        .trim()
        .isLength(8)
        .withMessage('Password should be at least 8 characters long'),

    body('password2')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
], authController.postRegister);

router.get('/logout', connectEnsure.ensureLoggedIn({ redirectTo: '/' }), authController.logout);

module.exports = router;
