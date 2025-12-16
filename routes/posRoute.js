const express = require("express");
const router = express.Router();
const posController = require("../controllers/posController");

// Render POS page
router.get("/pos", posController.renderPOS);

// Process payment (from modal)
router.post("/pos/pay", posController.processPayment);

// Show payment summary
router.get("/pos/summary", posController.paymentSummary);

module.exports = router;
