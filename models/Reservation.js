const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  name: String,
  email: String,
  contact: String,

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      description: String,
      quantity: Number,
      price: Number
    }
  ],

  total: Number,
  downpayment: Number, // NEW FIELD
  proofOfPayment: String, // NEW FIELD (image path)

  status: {
    type: String,
    default: 'Pending'
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports =
  mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);
