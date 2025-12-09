const Event = require('../models/Event');
const fs = require('fs');
const path = require('path');

const eventController = {

  // ✅ Render admin event page
  getEventForm: async (req, res) => {
    const events = await Event.find().sort({ date: 1 });
    res.render('eventForm', { events });
  },

  // ✅ Create event
 createEvent: async (req, res) => {
  try {
    const { title, description, date, time, location } = req.body;

    const event = new Event({
      title,
      description,
      date,
      time,
      location,
      image: req.file ? req.file.filename : null // ✅ optional
    });

    await event.save();
    res.redirect('/admin/event');
  } catch (error) {
    console.error('Error creating event:', error);
    req.flash('error', 'Failed to create event. Please check your input.');
    res.redirect('/admin/event');
  }
},


  // ✅ Update event
  updateEvent: async (req, res) => {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (req.file && event.image) {
      fs.unlinkSync(path.join('public/uploads/events', event.image));
    }

    await Event.findByIdAndUpdate(id, {
      ...req.body,
      image: req.file ? req.file.filename : event.image
    });

    res.redirect('/admin/event');
  },

  // ✅ Delete event (hard delete)
  deleteEvent: async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event.image) {
      fs.unlinkSync(path.join('public/uploads/events', event.image));
    }

    await Event.findByIdAndDelete(req.params.id);
    res.redirect('/admin/event');
  }
};

module.exports = eventController;
