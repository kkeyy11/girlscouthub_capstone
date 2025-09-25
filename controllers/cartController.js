// controllers/cartController.js
const Product = require('../models/Product');
const Reservation = require('../models/Reservation');
const { sendAppointmentEmail } = require('../utils/mailer');

// View cart
exports.viewCart = (req, res) => {
  const cart = req.session.cart || [];
  res.render('cart', { cart });
};

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.redirect('/products');

    if (!req.session.cart) req.session.cart = [];

    req.session.cart.push({
      productId: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: 1
    });

    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.redirect('/products');
  }
};

// Reserve cart (create reservation + notify admin)
exports.reserveCart = async (req, res) => {
  try {
    const { name, email, contact } = req.body;
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/cart');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const reservation = new Reservation({
      name,
      email,
      contact,
      items: cart,
      total,
    });

    await reservation.save();

    // Clear cart session
    req.session.cart = [];

    // ✉️ Notify admin
    await sendAppointmentEmail(
      process.env.GMAIL_USER, // admin email
      '📩 New Reservation Created',
      `A new reservation has been made by ${name} (${email}).
Contact: ${contact}
Total: ₱${total}

Please check the admin panel for more details.`
    );

    // ✉️ Notify user
    await sendAppointmentEmail(
      email,
      '✅ Reservation Received',
      `Hi ${name},

We have received your reservation. Our team will review it and notify you once it is approved.

Reservation Total: ₱${total}
Status: Pending

Thank you for choosing our service!`
    );

    res.redirect('/reservations');
  } catch (err) {
    console.error(err);
    res.redirect('/cart');
  }
};

// View reservations (grouped)
exports.viewReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ date: -1 }).populate('items.productId');

    // Group by email
    const groupedReservations = {};
    reservations.forEach(r => {
      if (!groupedReservations[r.email]) groupedReservations[r.email] = [];
      groupedReservations[r.email].push(r);
    });

    res.render('reservations', { groupedReservations });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

// Approve reservation (notify user)
exports.approveReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.redirect('/reservations');

    reservation.status = 'Approved';
    await reservation.save();

    // ✉️ Notify user
    await sendAppointmentEmail(
      reservation.email,
      '🎉 Reservation Approved',
      `Hi ${reservation.name},

Good news! Your reservation has been approved. 🎉
You may now proceed with the next steps.

Reservation Total: ₱${reservation.total}
Status: Approved

Thank you for trusting us!`
    );

    res.redirect('/reservations');
  } catch (err) {
    console.error(err);
    res.redirect('/reservations');
  }
};

// Remove reservation
exports.removeReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/reservations');
  } catch (err) {
    console.error(err);
    res.redirect('/reservations');
  }
};

// View reservation history
exports.viewReservationHistory = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ date: -1 });
    res.render('reservationHistory', { reservations });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

// Delete single reservation
exports.deleteReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/reservation-history');
  } catch (err) {
    console.error(err);
    res.redirect('/reservation-history');
  }
};

// Clear reservations by email
exports.clearReservations = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.redirect('/reservation-history');

    await Reservation.deleteMany({ email });
    res.redirect('/reservation-history');
  } catch (err) {
    console.error(err);
    res.redirect('/reservation-history');
  }
};

// Reorder from previous reservation
exports.reorderReservation = async (req, res) => {
  try {
    const prevReservation = await Reservation.findById(req.params.id).populate('items.productId');
    if (!prevReservation) return res.redirect('/reservation-history');

    req.session.cart = prevReservation.items.map(item => ({
      productId: item.productId._id,
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: item.quantity,
    }));

    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.redirect('/reservation-history');
  }
};

// Get reservation details
exports.getReservationDetails = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('items.productId');
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

    res.json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
