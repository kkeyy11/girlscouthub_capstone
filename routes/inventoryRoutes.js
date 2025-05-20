const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Inventory Report Routes
router.get('/inventory-report', inventoryController.getInventoryReport);
router.get('/inventory-report/download', inventoryController.downloadInventoryReport);

module.exports = router;
