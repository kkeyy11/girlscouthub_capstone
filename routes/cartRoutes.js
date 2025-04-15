const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// Cart routes to handle cart-related actions
router.get("/cart", cartController.viewCart);
router.post("/cart/add/:id", cartController.addToCart);
router.post("/cart/checkout", cartController.checkout);
router.get("/reservations", cartController.viewReservations);
router.get('/', cartController.getAllReservations);
router.post('/approve/:id', cartController.approveReservation);
router.post('/reservations/approve/:id', cartController.approveReservation);
router.get('/reservations', cartController.getReservationList);
//router.post('/reservations/approve/:id', cartController.approveReservation);


module.exports = router;
