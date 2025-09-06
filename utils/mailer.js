const nodemailer = require('nodemailer');
require('dotenv').config();

console.log("Email credentials loaded:", process.env.EMAIL_USER, process.env.EMAIL_PASS ? '✅' : '❌');

// Railway-safe Gmail transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000, // fail fast instead of hanging
});

// Reusable function
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `"GSP System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
  }
};

module.exports = { sendEmail };
