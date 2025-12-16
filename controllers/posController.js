const Product = require("../models/Product");

let cart = [];
let invoiceData = {};

exports.renderPOS = async (req, res) => {
  const products = await Product.find();
  res.render("pointofsale", { user: req.user, products, cart });
};

exports.toPayment = (req, res) => {
  try {
    cart = JSON.parse(req.body.cart) || [];
  } catch (e) {
    cart = [];
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  invoiceData.total = total;

  res.render("payment", { user: req.user, total });
};

exports.processPayment = async (req, res) => {
  // Read cash and convert to number
  const cashRaw = req.body.cash;
  const cash = parseFloat(cashRaw);

  const total = invoiceData.total;

  // If cash is invalid or less than total, show POS page
  if (typeof cashRaw === 'undefined' || isNaN(cash) || cash < total) {
    return res.redirect("/pos");
  }

  // Deduct stock
  for (let item of cart) {
    await Product.findByIdAndUpdate(item.id, { $inc: { quantity: -item.qty } });
  }

  // Prepare invoice data
  invoiceData = {
    invoiceNo: "INV-" + Date.now(),
    cart,
    total,
    cash,
    change: cash - total
  };

  // Clear cart for next transaction
  cart = [];

  // Redirect to payment summary
  res.redirect("/pos/summary");
};

exports.paymentSummary = async (req, res) => {
  const updatedProducts = await Product.find();
  res.render("paymentsummary", { user: req.user, invoiceData, updatedProducts });
};
