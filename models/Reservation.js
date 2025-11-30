const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference user
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
  downpayment: Number,
  proofOfPayment: String, 

  status: {
    type: String,
    default: 'Pending'
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);
