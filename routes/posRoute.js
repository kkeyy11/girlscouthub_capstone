const express = require("express");
const router = express.Router();
const posController = require("../controllers/posController");

// Walk-in POS
router.get("/pos", posController.renderPOS);

// Reservation POS
router.get("/reservation/:id", posController.loadReservationPOS);

// Proceed to payment
router.post("/payment", posController.toPayment);

// Process payment
router.post("/pay", posController.processPayment);

// Payment summary
router.get("/summary", posController.paymentSummary);

module.exports = router;
