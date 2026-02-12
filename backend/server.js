const express = require("express");
const cors = require("cors");
require("dotenv").config();
const surpriseRoutes = require("./routes/surpriseRoutes");
const gameRoutes = require("./routes/gameRoutes");
const mongoose = require("mongoose");




const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

/* ===========================
   MIDDLEWARE
=========================== */
app.use(cors());
app.use(express.json());
app.use("/api/surprise", surpriseRoutes);
app.use("/api/game", gameRoutes);



/* ===========================
   SPOTIFY CONFIG
=========================== */
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

/* ===========================
   EXISTING ROUTES
=========================== */
const moodRoutes = require("./routes/moodRoutes");
app.use("/api/mood", moodRoutes);

/* ===========================
   PHASE 1: SPOTIFY AUTH ROUTES
=========================== */

// Step 1: Redirect user to Spotify login
app.get("/api/spotify/login", (req, res) => {
  const scopes = ["user-read-email", "user-read-private"];
  const authURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authURL);
});

// Step 2: Spotify callback
app.get("/api/spotify/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);

    spotifyApi.setAccessToken(data.body.access_token);
    spotifyApi.setRefreshToken(data.body.refresh_token);

    res.json({
      success: true,
      message: "Spotify connected successfully",
    });
  } catch (err) {
    console.error("Spotify error:", err.message);
    res.status(500).json({ error: "Spotify authentication failed" });
  }
});

/* ===========================
   HEALTH CHECK
=========================== */
app.get("/", (req, res) => {
  res.json({
    message: "ECHONA Backend API",
    status: "running",
    phase: "PHASE 1 - Spotify Integration",
    timestamp: new Date().toISOString(),
  });
});

/* ===========================
   ERROR HANDLING
=========================== */
app.use((err, req, res, next) => {
  console.error("[Server Error]:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

/* ===========================
   SERVER START
=========================== */
const PORT = 5001;

app.listen(PORT, () => {
  console.log(`🚀 ECHONA Backend running on http://localhost:${PORT}`);
  console.log("🎧 PHASE 1: Spotify Integration active");
});

// Keep process alive
setInterval(() => {
  // This prevents the process from exiting
}, 1000);

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
