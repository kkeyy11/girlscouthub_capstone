const Product = require("../models/Product");
const Reservation = require("../models/Reservation");

let cart = [];
let invoiceData = {};
let currentUser = null; // for reservation transaction

// Render POS for walk-in or reservation
exports.renderPOS = async (req, res) => {
  const products = await Product.find();
  cart = []; // reset cart on fresh load
  currentUser = null;
  res.render("pointofsale", { user: req.user, products, cart, customer: null });
};

// Load POS with reservation items
exports.loadReservationPOS = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate("user");
    if (!reservation) return res.redirect("/reservations");

    cart = reservation.items.map(item => ({
      id: item.productId._id,
      name: item.name,
      price: item.price,
      qty: item.quantity,
      stock: item.productId.quantity
    }));

    currentUser = reservation.user; // store for invoice
    const products = await Product.find();

    res.render("pointofsale", { user: req.user, products, cart, customer: currentUser, reservationId: reservation._id });
  } catch (err) {
    console.error(err);
    res.redirect("/reservations");
  }
};

// Proceed to payment
exports.toPayment = (req, res) => {
  if (!cart || cart.length === 0) {
    return res.status(400).send("Cart is empty");
  }
  invoiceData.total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  res.render("payment", { user: req.user, total: invoiceData.total, customer: currentUser });
};

// Process payment
exports.processPayment = async (req, res) => {
  const cash = Number(req.body.cash);
  const total = invoiceData.total;

  if (cash < total) {
    return res.status(400).send({ error: "Insufficient cash" });
  }

  // Update inventory
  for (let item of cart) {
    await Product.findByIdAndUpdate(item.id, { $inc: { quantity: -item.qty } });
  }

  // If reservation, update status
  if (req.body.reservationId) {
    await Reservation.findByIdAndUpdate(req.body.reservationId, { status: "Approved" });
  }

  invoiceData = {
    invoiceNo: "INV-" + Date.now(),
    cart,
    total,
    cash,
    change: cash - total,
    customer: currentUser
  };

  res.redirect("/pos/summary");
};

// Payment summary
exports.paymentSummary = async (req, res) => {
  // Get updated product quantities for inventory display
  const updatedProducts = await Product.find();
  res.render("paymentsummary", { user: req.user, invoiceData, updatedProducts });
};
