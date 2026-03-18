const { OAuth2Client } = require("google-auth-library");
const config = require("../config");

let client = null;

function getClient() {
  if (!client) {
    if (!config.googleClientId) {
      throw new Error("GOOGLE_CLIENT_ID is not configured");
    }
    client = new OAuth2Client(config.googleClientId);
  }
  return client;
}

/**
 * Verify a Google ID token credential and return the payload.
 * Throws if the token is invalid or the audience does not match.
 */
async function verifyGoogleToken(idToken) {
  if (!config.googleClientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }
  const ticket = await getClient().verifyIdToken({
    idToken,
    audience: config.googleClientId,
  });
  return ticket.getPayload();
}

module.exports = { verifyGoogleToken };
