const express = require("express");
const router = express.Router();
const getGmailClient = require("../utils/googleClient");

router.get("/send-test", async (req, res) => {
  try {
    const gmail = getGmailClient();

    const rawMessage = [
      "From: \"Girl Scout Hub\" <yourgmail@gmail.com>",
      "To: yourgmail@gmail.com",
      "Subject: Test Email",
      "",
      "Hello from Girl Scout Hub + Gmail API 🚀",
    ]
      .join("\n")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: rawMessage,
      },
    });

    res.send("✅ Email sent!");
  } catch (err) {
    console.error(err);
    res.send("❌ Failed: " + err.message);
  }
});

module.exports = router;
