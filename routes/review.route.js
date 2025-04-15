const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const connectEnsureLogin = require('connect-ensure-login');

// user side
router.get('/user/reviews', connectEnsureLogin.ensureLoggedIn('/auth/login'), reviewController.getUserReviews);
router.post('/user/reviews', connectEnsureLogin.ensureLoggedIn('/auth/login'), reviewController.postUserReview);

// admin side
router.get('/admin/reviews', connectEnsureLogin.ensureLoggedIn('/auth/login'), reviewController.getAdminReviews);

module.exports = router;
