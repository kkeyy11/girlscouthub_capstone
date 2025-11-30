const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional reference
  name: String,  // keeps old reservations working
  email: String, // keeps old reservations working
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

// // Optional: virtual to always get "displayName" or "displayEmail" 
// reservationSchema.virtual('reservedBy').get(function() {
//   // If user is populated, use it, else fallback to stored name/email
//   if (this.user && this.user.firstName && this.user.lastName) {
//     return `${this.user.firstName} ${this.user.lastName}`;
//   }
//   return this.name || 'N/A';
// });

// reservationSchema.virtual('userEmail').get(function() {
//   if (this.user && this.user.email) return this.user.email;
//   return this.email || 'N/A';
// });

// module.exports = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);
