const { google } = require("googleapis");

async function getGmailClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  // 🔑 Ensure we actually fetch a valid access token
  await oauth2Client.getAccessToken();

  return google.gmail({ version: "v1", auth: oauth2Client });
}

module.exports = getGmailClient;
