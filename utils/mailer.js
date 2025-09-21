// utils/mailer.js
const getGmailClient = require("./googleClient");

// helper to base64url encode MIME message
function encodeMessage(message) {
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// generic sendEmail
async function sendEmail({ to, subject, text }) {
  try {
    const gmail = await getGmailClient();

    const from = process.env.GMAIL_USER;
    const mimeMessage =
      `From: "GSP System" <${from}>\r\n` +
      `To: ${to}\r\n` +
      `Subject: ${subject}\r\n\r\n` +
      `${text}`;

    const encodedMessage = encodeMessage(mimeMessage);

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`✅ Email sent to ${to}:`, res.data.id);
    return res.data;
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err);
    throw err;
  }
}

// Specific helpers
async function sendVerificationEmail(to, link) {
  return sendEmail({
    to,
    subject: "Verify your email",
    text: `Click the link to verify your account:\n\n${link}`,
  });
}

async function sendResetPasswordEmail(to, link) {
  return sendEmail({
    to,
    subject: "Reset your password",
    text: `Click the link to reset your password:\n\n${link}`,
  });
}

// ✅ New function for Event notification
async function sendAppointmentEmail(to, subject, text) {
  return sendEmail({ to, subject, text });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendAppointmentEmail,
};
