const User = require('../models/user.model');
const Event = require('../models/Event');
const { sendAppointmentEmail } = require('../utils/mailer');
//try lang 

const eventController = {
  // Render event creation form
  getEventForm: async (req, res) => {
    try {
      const notificationsCount = await Event.countDocuments({ dismissed: false });
      res.render('eventForm', { message: null, notificationsCount });
    } catch (error) {
      console.error("Error fetching notifications count:", error);
      res.status(500).send('Error loading page');
    }
  },

  // Create new event and notify users
  createEvent: async (req, res) => {
    try {
      const { title, description, date, time, location } = req.body;
      if (!title || !description || !date || !time || !location) {
        return res.status(400).send("Missing required fields");
      }

      // Save the new event
      const newEvent = new Event({ title, description, date, time, location });
      await newEvent.save();

      // Fetch all users with email
      const users = await User.find({}, 'email');

      // Prepare email content
      const subject = `New Event: ${title}`;
      const text = `Hello,\n\nA new event has been posted.\n\nTitle: ${title}\nDescription: ${description}\nDate: ${date}\nTime: ${time}\nLocation: ${location}\n\nBest regards,\nYour Team`;

      // Send emails concurrently
      const emailPromises = users
        .filter(user => user.email)
        .map(user =>
          sendAppointmentEmail(user.email, subject, text)
            .then(() => console.log(`✅ Email sent to ${user.email}`))
            .catch(err => console.error(`❌ Failed to send email to ${user.email}:`, err))
        );

      await Promise.all(emailPromises);

      res.redirect('/admin/event');
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).send('Error creating event');
    }
  },

  // Get all events with notification count
  getEvents: async (req, res) => {
    try {
      const events = await Event.find();
      const notificationsCount = await Event.countDocuments({ dismissed: false });
      res.render('eventList', { events, notificationsCount });
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).send('Error fetching events');
    }
  },

  // Dismiss notification
  dismissNotification: async (req, res) => {
    try {
      const eventId = req.params.id;
      await Event.findByIdAndUpdate(eventId, { dismissed: true });
      res.json({ success: true });
    } catch (error) {
      console.error("Error dismissing notification:", error);
      res.status(500).json({ success: false });
    }
  },

  // Render user-facing event list
  getEventList: async (req, res) => {
    try {
      const events = await Event.find();
      res.render('user/eventList', { events });
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).send('Error fetching events');
    }
  },
};

module.exports = eventController;
