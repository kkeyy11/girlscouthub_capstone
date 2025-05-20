const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/cart', cartController.viewCart);
router.get('/add-to-cart/:id', cartController.addToCart);
router.post('/reserve', cartController.reserveCart);
router.get('/reservations', cartController.viewReservations);
router.post('/approve/:id', cartController.approveReservation);
router.post('/remove/:id', cartController.removeReservation);

module.exports = router;
