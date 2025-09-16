// routes/testMail.js
const express = require("express");
const router = express.Router();
const getGmailClient = require("../utils/googleClient"); // ✅ make sure this uses oauth2Client + refresh_token

// helper to base64url encode
function encodeMessage(message) {
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

router.get("/send-test", async (req, res) => {
  try {
    // ✅ get Gmail client with refreshed access token
    const gmail = await getGmailClient();

    const from = process.env.GMAIL_USER;
    const to = process.env.GMAIL_USER; // send to yourself for testing
    const subject = "Test Email";
    const body = "Hello from Girl Scout Hub - Gmail API 🚀";

    // Proper MIME message
    const mimeMessage =
      `From: Girl Scout Hub <${from}>\r\n` +
      `To: ${to}\r\n` +
      `Subject: ${subject}\r\n\r\n` +
      `${body}`;

    const encodedMessage = encodeMessage(mimeMessage);

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    res.send("✅ Test email sent!");
  } catch (error) {
    console.error("Send email failed:", error);
    res.status(500).send("❌ Failed: " + error.message);
  }
});

module.exports = router;
