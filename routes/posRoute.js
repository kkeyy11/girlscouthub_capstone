const express = require("express");
const router = express.Router();
const posController = require("../controllers/posController");


router.get("/pos", posController.renderPOS);
router.post("/pos/payment", posController.toPayment);
router.post("/pos/pay", posController.processPayment);
router.get("/pos/summary", posController.paymentSummary);


module.exports = router;