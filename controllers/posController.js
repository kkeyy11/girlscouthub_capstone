const Product = require("../models/Product");
const Reservation = require("../models/Reservation");

let cart = [];
let invoiceData = {};
let customerName = "";
let reservationId = null; // Track if the cart came from a reservation

// Render POS page with products and approved reservations
exports.renderPOS = async (req, res) => {
  const products = await Product.find();
  const reservations = await Reservation.find({ status: "Approved" }).populate("user");

  res.render("pointofsale", {
    user: req.user,
    products,
    reservations,
    cart
  });
};

// Process Payment (from modal)
exports.processPayment = async (req, res) => {
  try {
    const cash = parseFloat(req.body.cash);
    cart = JSON.parse(req.body.cart) || [];
    customerName = req.body.customerName || "";
    reservationId = req.body.reservationId || null;

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    if (isNaN(cash) || cash < total) {
      // Cash insufficient, just redirect back (modal handles UI)
      return res.redirect("/pos");
    }

    // Deduct stocks
    for (let item of cart) {
      await Product.findByIdAndUpdate(item.id, { $inc: { quantity: -item.qty } });
    }

    // Update reservation status if applicable
    if(reservationId) {
      await Reservation.findByIdAndUpdate(reservationId, { status: 'Completed' });
      reservationId = null;
    }

    // Prepare invoice
    invoiceData = {
      invoiceNo: "INV-" + Date.now(),
      customerName,
      cart,
      total,
      cash,
      change: cash - total
    };

    // Reset cart
    cart = [];
    customerName = "";

    res.redirect("/pos/summary");
  } catch (err) {
    console.error(err);
    res.redirect("/pos");
  }
};

// Render Payment Summary
exports.paymentSummary = async (req, res) => {
  const updatedProducts = await Product.find();
  res.render("paymentsummary", {
    user: req.user,
    invoiceData,
    updatedProducts
  });
};
