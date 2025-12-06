const Product = require('../models/Product');
const Reservation = require('../models/Reservation');
const { sendAppointmentEmail } = require('../utils/mailer');

const MAX_RESERVATIONS_PER_DAY = 2;

// View cart
exports.viewCart = async (req, res) => {
  try {
    const cart = req.session.cart || [];
    const success = req.query.reserved === "success";
    const limit = req.query.limit === "true";

    let reservations = [];
    if (req.user) {
      reservations = await Reservation.find({ user: req.user._id })
        .sort({ date: -1 })
        .populate('items.productId')
        .populate('user');
    }

    res.render('cart', { cart, success, limit, reservations, user: req.user });
  } catch (err) {
    console.error('Error loading cart:', err);
    res.render('cart', { cart: [], success: false, limit: false, reservations: [], user: req.user || null });
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

// Reserve cart
exports.reserveCart = async (req, res) => {
  try {
    if (!req.user) return res.redirect('/login');

    const { contact, downpayment } = req.body;
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/cart');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const reservationCount = await Reservation.countDocuments({
      user: req.user._id,
      date: { $gte: todayStart }
    });

    if (reservationCount >= MAX_RESERVATIONS_PER_DAY) {
      return res.redirect('/cart?limit=true');
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let proofPath = null;
    if (req.file) proofPath = `/uploads/proofs/${req.file.filename}`;

    const reservation = new Reservation({
      user: req.user._id,
      contact,
      items: cart,
      total,
      downpayment: Number(downpayment) || 0,
      proofOfPayment: proofPath
    });

    await reservation.save();
    req.session.cart = [];

    await sendAppointmentEmail(
      process.env.GMAIL_USER,
      '📩 New Reservation Created',
      `New reservation by ${req.user.firstName} ${req.user.lastName} (${req.user.email})  
      Contact: ${contact}  
      Total: ₱${total}  
      Downpayment: ₱${downpayment}`
    );

    await sendAppointmentEmail(
      req.user.email,
      '✅ Reservation Received',
      `Hi ${req.user.firstName},\n\nWe received your reservation.\nTotal: ₱${total}\nDownpayment: ₱${downpayment}\nStatus: Pending`
    );

    res.redirect('/cart?reserved=success');
  } catch (err) {
    console.error('Error reserving cart:', err);
    res.status(500).send('Error reserving cart');
  }
};

// View all reservations (admin)
exports.viewReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .sort({ date: -1 })
      .populate('items.productId')
      .populate('user');

    const groupedReservations = {};
    reservations.forEach(r => {
      const email = r.user ? r.user.email : 'unknown';
      if (!groupedReservations[email]) groupedReservations[email] = [];
      groupedReservations[email].push({
        ...r._doc,
        name: r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Unknown User',
        email: email
      });
    });

    res.render('reservations', { groupedReservations });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

// Approve reservation
exports.approveReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.redirect('/reservations');

    reservation.status = 'Approved';
    await reservation.save();

    await sendAppointmentEmail(
      reservation.email,
      '🎉 Reservation Approved',
      `Hi ${reservation.name},\nYour reservation has been approved.\nTotal: ₱${reservation.total}\nDownpayment: ₱${reservation.downpayment}\nStatus: Approved`
    );

    res.redirect('/reservations');
  } catch (err) {
    console.error(err);
    res.redirect('/reservations');
  }
};

// Delete reservation (user)
exports.deleteReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.redirect('/cart');
  }
};

// Reorder reservation
exports.reorderReservation = async (req, res) => {
  try {
    const prevReservation = await Reservation.findById(req.params.id).populate('items.productId');
    if (!prevReservation) return res.redirect('/cart');

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
    res.redirect('/cart');
  }
};

// Get reservation details (for preview)
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
