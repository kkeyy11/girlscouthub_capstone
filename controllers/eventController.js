const User = require('../models/user.model');

const Event = require('../models/Event');
const nodemailer = require('nodemailer');
const { sendAppointmentEmail } = require('../utils/mailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

// Get event form
exports.getEventForm = async (req, res) => {
    try {
        const notificationsCount = await Event.countDocuments({ dismissed: false });
        res.render('eventForm', { message: null, notificationsCount });
    } catch (error) {
        console.error("Error fetching notifications count:", error);
        res.status(500).send('Error loading page');
    }
};

// Post event form
exports.createEvent = async (req, res) => {
    try {
        if (!req.body.title || !req.body.description || !req.body.date || !req.body.time || !req.body.location) {
            return res.status(400).send("Missing required fields");
        }

        const { title, description, date, time, location } = req.body;
        const newEvent = new Event({ title, description, date, time, location });
        await newEvent.save();

        const users = await User.find({}, 'email');

        // Prepare email content
        const subject = `New Event: ${title}`;
        const text = `Hello,\n\nA new event has been posted.\n\nTitle: ${title}\nDescription: ${description}\nDate: ${date}\nTime: ${time}\nLocation: ${location}\n\nBest regards,\nYour Team`;

        // Send emails to all users, no await here to avoid blocking (optional improvement below)
        users.forEach(user => {
            if (user.email) {
                sendAppointmentEmail(user.email, subject, text);
            }
        });

        res.redirect('/admin/event');
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).send('Error creating event');
    }
};





// Get event list with notifications
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find();
        const notificationsCount = await Event.countDocuments({ dismissed: false });
        res.render('eventList', { events, notificationsCount });
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).send('Error fetching events');
    }
};

// Dismiss notification
exports.dismissNotification = async (req, res) => {
    try {
        const eventId = req.params.id;
        await Event.findByIdAndUpdate(eventId, { dismissed: true });

        res.json({ success: true });
    } catch (error) {
        console.error("Error dismissing notification:", error);
        res.status(500).json({ success: false });
    }
};

exports.getEventList = async (req, res) => {
    try {
        const events = await Event.find(); // ✅ Ensure all fields are fetched
        res.render('/user/eventList', { events }); // ✅ Pass events to the view
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).send('Error fetching events');
    }
};

