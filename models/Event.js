    const mongoose = require('mongoose');

    const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    endDate: { type: Date, required: true },    // ✅ new
    endTime: { type: String, required: true },  // ✅ new
    location: { type: String, required: true },
    image: { type: String },
    createdAt: { type: Date, default: Date.now }
    });

    module.exports = mongoose.model('Event', eventSchema);
