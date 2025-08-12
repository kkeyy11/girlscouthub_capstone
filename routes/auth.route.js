const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const connectEnsure = require('connect-ensure-login');
const upload = require('../middlewares/upload');
const passport = require('passport');

// GET login
router.get('/login', connectEnsure.ensureLoggedOut({ redirectTo: '/' }), authController.getLogin);

// POST login using passport
router.post(
  '/login',
  connectEnsure.ensureLoggedOut({ redirectTo: '/' }),
  passport.authenticate('local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
  })
);

// GET register
router.get('/register', connectEnsure.ensureLoggedOut({ redirectTo: '/' }), authController.getRegister);

// POST register with validation
router.post(
  '/register',
  connectEnsure.ensureLoggedOut({ redirectTo: '/' }),
  upload.single('profileImage'),
  [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Min 8 chars'),
  body('password2').custom((val, { req }) => {
    if (val !== req.body.password) {
      throw new Error('Passwords must match');
    }
    return true;
  })
],
  authController.postRegister
);

// Verify Email
router.get('/verify-email/:token', authController.verifyEmail);

// Logout
router.get('/logout', connectEnsure.ensureLoggedIn({ redirectTo: '/' }), authController.logout);

// Forgot Password
router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);

// Reset Password
router.get('/reset-password/:token', authController.getResetPassword);
router.post('/reset-password/:token', authController.postResetPassword);

module.exports = router;
