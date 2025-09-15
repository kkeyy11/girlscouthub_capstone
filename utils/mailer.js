const nodemailer = require('nodemailer');
require('dotenv').config();

console.log("Email credentials:", process.env.EMAIL_USER, process.env.EMAIL_PASS ? '✅' : '❌');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // must be App Password if 2FA is on
  },
  logger: true,   // enable detailed logs
  debug: true     // show SMTP traffic in console
});

// Verify transporter immediately
transporter.verify((error, success) => {
  if (error) {
    console.error('Error verifying transporter:', error);
  } else {
    console.log('SMTP transporter verified ✅');
  }
});

const sendAppointmentEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `"GSP System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}:`, info.response);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
};

module.exports = { sendAppointmentEmail, transporter };
