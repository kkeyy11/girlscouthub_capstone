const Product = require('../models/Product');
const moment = require('moment');

// Display filtered inventory
exports.getInventoryReport = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    let filter = {};

    if (category) {
      filter.category = { $regex: new RegExp(category, 'i') }; // Case-insensitive
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const inventory = await Product.find(filter).sort({ createdAt: -1 });
    res.render('inventoryReport', { inventory, category, startDate, endDate });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating report');
  }
};

// (Optional) Export to PDF (just render view to HTML here)
exports.downloadInventoryReport = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    let filter = {};

    if (category) filter.category = { $regex: new RegExp(category, 'i') };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const inventory = await Product.find(filter).sort({ createdAt: -1 });

    // Render as HTML, then you can convert to PDF using html-pdf/puppeteer
    res.render('inventoryReport', { inventory, category, startDate, endDate });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error downloading report');
  }
};
