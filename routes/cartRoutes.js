// const express = require('express');
// const router = express.Router();
// const cartController = require('../controllers/cartController');

// router.get('/cart', cartController.viewCart);
// router.get('/add-to-cart/:id', cartController.addToCart);
// router.post('/reserve', cartController.reserveCart);
// router.get('/reservations', cartController.viewReservations);
// router.post('/approve/:id', cartController.approveReservation);
// router.post('/remove/:id', cartController.removeReservation);

// module.exports = router;




const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/cart', cartController.viewCart);
router.get('/add-to-cart/:id', cartController.addToCart);

router.post('/reserve', cartController.reserveCart);
router.get('/reservations', cartController.viewReservations);
router.post('/approve/:id', cartController.approveReservation);
router.post('/remove/:id', cartController.removeReservation);

//bago
router.get('/reservation-history', cartController.viewReservationHistory);

// Delete single reservation by ID
router.post('/delete-reservation/:id', cartController.deleteReservation);

// Delete all reservations by email
router.post('/clear-reservations', cartController.clearReservations);

module.exports = router;
