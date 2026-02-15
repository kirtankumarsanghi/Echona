const express = require("express");
const {
  isSpotifyConfigured,
  getUserApi,
  executeWithRetry,
  refreshAccessToken,
  searchTracks,
  getServiceHealth,
  mapSpotifyError,
} = require("../services/spotifyService");
const config = require("../config");

const router = express.Router();
const FRONTEND_URL = config.frontendUrl;
const VALID_TIME_RANGES = new Set(["short_term", "medium_term", "long_term"]);

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function sendSpotifyError(res, error, fallbackMessage) {
  const mapped = mapSpotifyError(error, fallbackMessage);
  return res.status(mapped.statusCode).json({
    success: false,
    error: mapped.error,
    message: mapped.message,
  });
}

function ensureSpotifyCredentials(res) {
  if (isSpotifyConfigured()) {
    return true;
  }

  res.status(503).json({
    success: false,
    error: "Spotify unavailable",
    message: "Spotify credentials missing on server",
  });
  return false;
}

router.get("/health", async (req, res) => {
  try {
    const health = await getServiceHealth();
    const statusCode = health.success ? 200 : 503;
    return res.status(statusCode).json(health);
  } catch (error) {
    console.error("[Spotify Health] Error:", error.message);
    return res.status(503).json({
      success: false,
      error: "Spotify health check failed",
      message: error.message,
    });
  }
});

router.get("/login", (req, res) => {
  if (!ensureSpotifyCredentials(res)) {
    return;
  }

  try {
    const scopes = [
      "user-read-email",
      "user-read-private",
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "user-top-read",
      "user-read-recently-played",
      "streaming",
      "playlist-read-private",
      "playlist-read-collaborative",
    ];

    const api = getUserApi();
    const authUrl = api.createAuthorizeURL(scopes, "echona_spotify_state");
    res.redirect(authUrl);
  } catch (error) {
    console.error("[Spotify] OAuth login error:", error.message);
    res.redirect(`${FRONTEND_URL}/callback?error=spotify_login_failed`);
  }
});

router.get("/callback", async (req, res) => {
  if (!ensureSpotifyCredentials(res)) {
    return;
  }

  const code = req.query.code;
  const authError = req.query.error;

  if (authError) {
    return res.redirect(`${FRONTEND_URL}/callback?error=${encodeURIComponent(authError)}`);
  }

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/callback?error=no_code`);
  }

  try {
    const api = getUserApi();
    const grant = await executeWithRetry(() => api.authorizationCodeGrant(code), {
      retries: 1,
      fallbackMessage: "Spotify authorization failed",
    });

    const accessToken = grant.body.access_token;
    const refreshToken = grant.body.refresh_token;
    const expiresIn = grant.body.expires_in;

    return res.redirect(
      `${FRONTEND_URL}/callback?access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(
        refreshToken
      )}&expires_in=${encodeURIComponent(expiresIn)}`
    );
  } catch (error) {
    return res.redirect(`${FRONTEND_URL}/callback?error=auth_failed`);
  }
});

router.post("/refresh", async (req, res) => {
  if (!ensureSpotifyCredentials(res)) {
    return;
  }

  const refreshToken = req.body.refreshToken || req.body.refresh_token;
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      message: "Refresh token required",
    });
  }

  try {
    const tokens = await refreshAccessToken(refreshToken);
    return res.json({ success: true, ...tokens });
  } catch (error) {
    return sendSpotifyError(res, error, "Failed to refresh Spotify token");
  }
});

router.post("/play", async (req, res) => {
  const token = getBearerToken(req);
  const deviceId = req.body.deviceId || req.body.device_id;
  const trackUri = req.body.trackUri || req.body.uri;
  const uris = Array.isArray(req.body.uris) ? req.body.uris : trackUri ? [trackUri] : [];

  if (!token) {
    return res.status(401).json({ success: false, error: "Authentication required", message: "Spotify token missing" });
  }

  if (uris.length === 0) {
    return res.status(400).json({ success: false, error: "Validation failed", message: "No track URI provided" });
  }

  try {
    const api = getUserApi(token);
    const payload = deviceId ? { device_id: deviceId, uris } : { uris };

    await executeWithRetry(() => api.play(payload), {
      retries: 1,
      fallbackMessage: "Failed to start playback",
    });

    return res.json({ success: true, message: "Playback started" });
  } catch (error) {
    return sendSpotifyError(res, error, "Failed to play track");
  }
});

router.get("/me", async (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "Authentication required", message: "Spotify token missing" });
  }

  try {
    const api = getUserApi(token);
    const data = await executeWithRetry(() => api.getMe(), {
      retries: 1,
      fallbackMessage: "Failed to get Spotify profile",
    });
    return res.json(data.body);
  } catch (error) {
    return sendSpotifyError(res, error, "Failed to get Spotify profile");
  }
});

router.get("/playlists", async (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "Authentication required", message: "Spotify token missing" });
  }

  try {
    const api = getUserApi(token);
    const data = await executeWithRetry(() => api.getUserPlaylists(), {
      retries: 1,
      fallbackMessage: "Failed to get Spotify playlists",
    });
    return res.json(data.body);
  } catch (error) {
    return sendSpotifyError(res, error, "Failed to get Spotify playlists");
  }
});

router.get("/recent", async (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "Authentication required", message: "Spotify token missing" });
  }

  try {
    const api = getUserApi(token);
    const data = await executeWithRetry(() => api.getMyRecentlyPlayedTracks({ limit: 20 }), {
      retries: 1,
      fallbackMessage: "Failed to get recently played tracks",
    });
    return res.json(data.body);
  } catch (error) {
    return sendSpotifyError(res, error, "Failed to get recently played tracks");
  }
});

router.get("/top-tracks", async (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "Authentication required", message: "Spotify token missing" });
  }

  try {
    const api = getUserApi(token);
    const timeRange = VALID_TIME_RANGES.has(req.query.time_range) ? req.query.time_range : "medium_term";
    const data = await executeWithRetry(() => api.getMyTopTracks({ limit: 20, time_range: timeRange }), {
      retries: 1,
      fallbackMessage: "Failed to get top tracks",
    });
    return res.json(data.body);
  } catch (error) {
    return sendSpotifyError(res, error, "Failed to get top tracks");
  }
});

router.get("/top-artists", async (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "Authentication required", message: "Spotify token missing" });
  }

  try {
    const api = getUserApi(token);
    const timeRange = VALID_TIME_RANGES.has(req.query.time_range) ? req.query.time_range : "medium_term";
    const data = await executeWithRetry(() => api.getMyTopArtists({ limit: 20, time_range: timeRange }), {
      retries: 1,
      fallbackMessage: "Failed to get top artists",
    });
    return res.json(data.body);
  } catch (error) {
    return sendSpotifyError(res, error, "Failed to get top artists");
  }
});

router.get("/playlist/:playlistId", async (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "Authentication required", message: "Spotify token missing" });
  }

  try {
    const api = getUserApi(token);
    const playlistId = String(req.params.playlistId || "").replace(/[^a-zA-Z0-9]/g, "");
    if (!playlistId) {
      return res.status(400).json({ success: false, error: "Invalid playlist ID" });
    }
    const data = await executeWithRetry(() => api.getPlaylistTracks(playlistId), {
      retries: 1,
      fallbackMessage: "Failed to get playlist tracks",
    });
    return res.json(data.body);
  } catch (error) {
    return sendSpotifyError(res, error, "Failed to get playlist tracks");
  }
});

router.get("/search", async (req, res) => {
  if (!ensureSpotifyCredentials(res)) {
    return;
  }

  const query = String(req.query.q || "").trim();
  if (!query) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      message: "Search query is required",
    });
  }

  try {
    const userToken = getBearerToken(req);
    const data = await searchTracks(query, userToken);
    return res.json(data);
  } catch (error) {
    return sendSpotifyError(res, error, "Spotify search unavailable");
  }
});

module.exports = router;
