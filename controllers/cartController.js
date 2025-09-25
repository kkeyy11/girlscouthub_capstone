// controllers/cartController.js
const Product = require("../models/Product");
const Reservation = require("../models/Reservation");
const { sendAppointmentEmail } = require("../utils/mailer");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // set this in .env

// View Cart (sample placeholder)
exports.viewCart = (req, res) => {
  res.render("cart", { cart: req.session.cart || [] });
};

// Add to Cart
exports.addToCart = async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send("Product not found");

    if (!req.session.cart) req.session.cart = [];

    req.session.cart.push({
      productId: product._id,
      name: product.name,
      description: product.description,
      quantity: 1,
      price: product.price,
    });

    res.redirect("/cart");
  } catch (err) {
    console.error("❌ Add to cart failed:", err);
    res.status(500).send("Server error");
  }
};

// Reserve Cart
exports.reserveCart = async (req, res) => {
  try {
    const { name, email, contact } = req.body;
    const cart = req.session.cart || [];

    if (cart.length === 0) {
      return res.status(400).send("Cart is empty");
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const reservation = new Reservation({
      name,
      email,
      contact,
      items: cart,
      total,
    });

    await reservation.save();
    req.session.cart = []; // clear cart after reserve

    // 📩 Notify admin
    await sendAppointmentEmail(
      ADMIN_EMAIL,
      "New Reservation Received",
      `A new reservation has been made by ${name} (${email}).\n\nTotal: ₱${total}\n\nPlease review it in the system.`
    );

    res.redirect("/reservations");
  } catch (err) {
    console.error("❌ Reserve cart failed:", err);
    res.status(500).send("Server error");
  }
};

// View All Reservations
exports.viewReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ date: -1 });
    res.render("reservations", { reservations });
  } catch (err) {
    console.error("❌ View reservations failed:", err);
    res.status(500).send("Server error");
  }
};

// Approve Reservation
exports.approveReservation = async (req, res) => {
  try {
    const id = req.params.id;
    const reservation = await Reservation.findById(id);

    if (!reservation) return res.status(404).send("Reservation not found");

    reservation.status = "Approved";
    await reservation.save();

    // 📩 Notify user
    await sendAppointmentEmail(
      reservation.email,
      "Your Reservation is Approved",
      `Hi ${reservation.name},\n\nYour reservation has been approved! 🎉\n\nTotal: ₱${reservation.total}\n\nThank you for choosing us!`
    );

    res.redirect("/reservations");
  } catch (err) {
    console.error("❌ Approve reservation failed:", err);
    res.status(500).send("Server error");
  }
};

// Remove Reservation (reject/delete single)
exports.removeReservation = async (req, res) => {
  try {
    const id = req.params.id;
    await Reservation.findByIdAndDelete(id);
    res.redirect("/reservations");
  } catch (err) {
    console.error("❌ Remove reservation failed:", err);
    res.status(500).send("Server error");
  }
};

// View Reservation History (all reservations sorted by date)
exports.viewReservationHistory = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ date: -1 });
    res.render("reservationHistory", { reservations });
  } catch (err) {
    console.error("❌ View history failed:", err);
    res.status(500).send("Server error");
  }
};

// Delete single reservation by ID
exports.deleteReservation = async (req, res) => {
  try {
    const id = req.params.id;
    await Reservation.findByIdAndDelete(id);
    res.redirect("/reservation-history");
  } catch (err) {
    console.error("❌ Delete reservation failed:", err);
    res.status(500).send("Server error");
  }
};

// Delete all reservations by email
exports.clearReservations = async (req, res) => {
  try {
    const { email } = req.body;
    await Reservation.deleteMany({ email });
    res.redirect("/reservation-history");
  } catch (err) {
    console.error("❌ Clear reservations failed:", err);
    res.status(500).send("Server error");
  }
};

// Reorder from previous reservation
exports.reorderReservation = async (req, res) => {
  try {
    const id = req.params.id;
    const reservation = await Reservation.findById(id);
    if (!reservation) return res.status(404).send("Reservation not found");

    req.session.cart = reservation.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
    }));

    res.redirect("/cart");
  } catch (err) {
    console.error("❌ Reorder failed:", err);
    res.status(500).send("Server error");
  }
};

// Get reservation details for preview
exports.getReservationDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const reservation = await Reservation.findById(id).populate("items.productId");
    if (!reservation) return res.status(404).send("Reservation not found");

    res.json(reservation);
  } catch (err) {
    console.error("❌ Get reservation details failed:", err);
    res.status(500).send("Server error");
  }
};
