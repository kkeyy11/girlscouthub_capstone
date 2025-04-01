const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }, // ✅ Ensure this exists
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    dismissed: { type: Boolean, default: false }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);