const Product = require("../models/Product");
const Reservation = require("../models/Reservation");

let cart = [];
let invoiceData = {};
let customerName = "";
let reservationId = null; // Track if the cart came from a reservation

exports.renderPOS = async (req, res) => {
  const products = await Product.find();
  const reservations = await Reservation.find({ status: "Approved" })
    .populate("user");

  res.render("pointofsale", {
    user: req.user,
    products,
    reservations,
    cart
  });
};

exports.toPayment = (req, res) => {
  try {
    cart = JSON.parse(req.body.cart) || [];
  } catch {
    cart = [];
  }

  customerName = req.body.customerName || "";

  reservationId = req.body.reservationId || null; // capture reservation ID if exists

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  invoiceData.total = total;

  res.render("payment", { user: req.user, total });
};

exports.processPayment = async (req, res) => {
  const cash = parseFloat(req.body.cash);
  const total = invoiceData.total;

  if (isNaN(cash) || cash < total) {
    return res.redirect("/pos");
  }

  // Deduct stocks
  for (let item of cart) {
    await Product.findByIdAndUpdate(item.id, {
      $inc: { quantity: -item.qty }
    });
  }

  // Update reservation status if applicable
  if(reservationId) {
    await Reservation.findByIdAndUpdate(reservationId, { status: 'Completed' });
    reservationId = null; // reset
  }

  invoiceData = {
    invoiceNo: "INV-" + Date.now(),
    customerName,
    cart,
    total,
    cash,
    change: cash - total
  };

  cart = [];
  customerName = "";

  res.redirect("/pos/summary");
};

exports.paymentSummary = async (req, res) => {
  const updatedProducts = await Product.find();
  res.render("paymentsummary", {
    user: req.user,
    invoiceData,
    updatedProducts
  });
};
