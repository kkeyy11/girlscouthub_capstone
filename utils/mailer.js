const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

async function createTransporter() {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    return transporter;
  } catch (err) {
    console.error("❌ Failed to create transporter:", err);
    throw err;
  }
}

async function sendEmail({ to, subject, text }) {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: `"GSP System" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`✅ Email sent to ${to}:`, info.response);
    return info;
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err);
    throw err;
  }
}

// Specific helpers for clarity
async function sendVerificationEmail(to, link) {
  return sendEmail({
    to,
    subject: "Verify your email",
    text: `Click to verify: ${link}`,
  });
}

async function sendResetPasswordEmail(to, link) {
  return sendEmail({
    to,
    subject: "Reset your password",
    text: `Reset your password: ${link}`,
  });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
};
