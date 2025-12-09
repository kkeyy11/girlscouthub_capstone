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
    const { title, description, date, time, endDate, endTime, location } = req.body;

    // ✅ Validation: end cannot be before start
    const start = new Date(`${date}T${time}`);
    const end = new Date(`${endDate}T${endTime}`);
    if (end < start) {
      req.flash('error', 'End date/time cannot be before start date/time.');
      return res.redirect('/admin/event');
    }

    const event = new Event({
      title,
      description,
      date,
      time,
      endDate,
      endTime,
      location,
      image: req.file ? req.file.filename : null
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
  try {
    const { id } = req.params;
    const { title, description, date, time, endDate, endTime, location } = req.body;

    const start = new Date(`${date}T${time}`);
    const end = new Date(`${endDate}T${endTime}`);
    if (end < start) {
      req.flash('error', 'End date/time cannot be before start date/time.');
      return res.redirect('/admin/event');
    }

    const event = await Event.findById(id);
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/admin/event');
    }

    // Delete old image if new uploaded
    if (req.file && event.image) {
      const oldImagePath = path.join('public/uploads/events', event.image);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    await Event.findByIdAndUpdate(id, {
      title, description, date, time, endDate, endTime, location,
      image: req.file ? req.file.filename : event.image
    });

    res.redirect('/admin/event');
  } catch (error) {
    console.error('Error updating event:', error);
    req.flash('error', 'Failed to update event');
    res.redirect('/admin/event');
  }
},

  // ✅ Delete event
  deleteEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        req.flash('error', 'Event not found');
        return res.redirect('/admin/event');
      }

      if (event.image) {
        const imagePath = path.join('public/uploads/events', event.image);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }

      await Event.findByIdAndDelete(req.params.id);
      res.redirect('/admin/event');
    } catch (error) {
      console.error('Error deleting event:', error);
      req.flash('error', 'Failed to delete event');
      res.redirect('/admin/event');
    }
  }

};

module.exports = eventController;
