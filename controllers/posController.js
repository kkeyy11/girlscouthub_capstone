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
  // Ensure cash is a valid number
  const cash = parseFloat(req.body.cash);
  const total = invoiceData.total;

  if (isNaN(cash) || cash < total) {
    // Optional: you can show an error message instead of redirect
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

  // Clear cart after payment
  cart = [];

  res.redirect("/pos/summary");
};

exports.paymentSummary = async (req, res) => {
  const updatedProducts = await Product.find();
  res.render("paymentsummary", { user: req.user, invoiceData, updatedProducts });
};
