

const express = require("express");
const spotifyApi = require("../spotify");

const router = express.Router();

// STEP 1: Redirect user to Spotify login
router.get("/login", (req, res) => {
  const scopes = [
    "user-read-email",
    "user-read-private"
  ];
  const authURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authURL);
});

// STEP 2: Spotify callback
router.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);

    spotifyApi.setAccessToken(data.body.access_token);
    spotifyApi.setRefreshToken(data.body.refresh_token);

    res.json({
      success: true,
      message: "Spotify connected successfully"
    });
  } catch (err) {
    res.status(500).json({ error: "Spotify authentication failed" });
  }
});

module.exports = router;
