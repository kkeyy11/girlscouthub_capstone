const Product = require('../models/Product');
const Reservation = require('../models/Reservation');
const { sendAppointmentEmail } = require('../utils/mailer');

// ANTI-SPAM SETTINGS
const MAX_RESERVATIONS_PER_DAY = 2; // LIMIT PER USER per day

// View cart
exports.viewCart = async (req, res) => {
  try {
    const cart = req.session.cart || [];
    const success = req.query.reserved === "success";
    const limit = req.query.limit === "true";

    let reservations = [];

    // Fetch reservation history for logged-in user
    if (req.session.email) {
      reservations = await Reservation.find({ email: req.session.email })
        .sort({ date: -1 })
        .populate('items.productId');
    }

    res.render('cart', { cart, success, limit, reservations });
  } catch (err) {
    console.error('Error loading cart:', err);
    res.render('cart', { cart: [], success: false, limit: false, reservations: [] });
  }
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

// Reserve cart (create reservation)
exports.reserveCart = async (req, res) => {
  try {
    const { name, email, contact, downpayment } = req.body;
    const cart = req.session.cart || [];

    if (cart.length === 0) return res.redirect('/cart');

    // DAILY LIMIT CHECK
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const reservationCount = await Reservation.countDocuments({
      email,
      date: { $gte: todayStart }
    });

    if (reservationCount >= MAX_RESERVATIONS_PER_DAY) {
      return res.redirect('/cart?limit=true');
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let proofPath = null;
    if (req.file) {
      proofPath = `/uploads/proofs/${req.file.filename}`;
    }

    const reservation = new Reservation({
      name,
      email,
      contact,
      items: cart,
      total,
      downpayment: Number(downpayment) || 0,
      proofOfPayment: proofPath
    });

    await reservation.save();
    req.session.cart = [];

    // Notify admin
    await sendAppointmentEmail(
      process.env.GMAIL_USER,
      '📩 New Reservation Created',
      `A new reservation has been made by ${name} (${email}).  
Contact: ${contact}  
Total: ₱${total}  
Downpayment: ₱${downpayment}  

Please check admin panel.`
    );

    // Notify user
    await sendAppointmentEmail(
      email,
      '✅ Reservation Received',
      `Hi ${name},

We have received your reservation.

Total: ₱${total}
Downpayment: ₱${downpayment}
Status: Pending

We will verify your proof of payment soon.`
    );

    res.redirect('/cart?reserved=success');
  } catch (err) {
    console.error('Error reserving cart:', err);
    res.status(500).send('Error reserving cart');
  }
};

// Admin: View reservations
exports.viewReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ date: -1 }).populate('items.productId');
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

// Admin: Approve reservation
exports.approveReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.redirect('/reservations');

    reservation.status = 'Approved';
    await reservation.save();

    await sendAppointmentEmail(
      reservation.email,
      '🎉 Reservation Approved',
      `Hi ${reservation.name},

Good news! Your reservation has been approved.

Total: ₱${reservation.total}
Downpayment: ₱${reservation.downpayment}
Status: Approved`
    );

    res.redirect('/reservations');
  } catch (err) {
    console.error(err);
    res.redirect('/reservations');
  }
};

// Admin: Remove reservation
exports.removeReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/reservations');
  } catch (err) {
    console.error(err);
    res.redirect('/reservations');
  }
};

// USER: Reservation history page (optional separate route)
exports.viewReservationHistory = async (req, res) => {
  try {
    if (!req.session.email) return res.redirect('/login');

    const reservations = await Reservation.find({ email: req.session.email })
      .sort({ date: -1 })
      .populate('items.productId');

    res.render('reservationHistory', { reservations });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

// USER: Delete reservation
exports.deleteReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/reservation-history');
  } catch (err) {
    console.error(err);
    res.redirect('/reservation-history');
  }
};

// USER: Clear all reservations
exports.clearReservations = async (req, res) => {
  try {
    await Reservation.deleteMany({ email: req.body.email });
    res.redirect('/reservation-history');
  } catch (err) {
    console.error(err);
    res.redirect('/reservation-history');
  }
};

// USER: Reorder reservation
exports.reorderReservation = async (req, res) => {
  try {
    const prevReservation = await Reservation.findById(req.params.id).populate('items.productId');
    if (!prevReservation) return res.redirect('/reservation-history');

    req.session.cart = prevReservation.items.map(item => ({
      productId: item.productId._id,
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: item.quantity
    }));

    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.redirect('/reservation-history');
  }
};

// Admin: Get reservation details (for reorder preview)
exports.getReservationDetails = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('items.productId');
    if (!reservation) return res.status(404).json({ error: 'Not found' });

    res.json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
};
