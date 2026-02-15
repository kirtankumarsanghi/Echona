const TOKEN_KEY = "echona_token";
const USER_KEY = "echona_user";
const SPOTIFY_TOKEN_KEY = "spotify_token";
const SPOTIFY_REFRESH_KEY = "spotify_refresh_token";

/**
 * Decode a JWT payload without a library (base64url decode).
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired (with 60s buffer).
 */
function isTokenExpired(token) {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return false; // no exp = assume valid
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp < nowSec + 60; // 60s buffer
}

/**
 * Returns true if user has a valid, non-expired auth token.
 */
export function isLoggedIn() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  if (isTokenExpired(token)) {
    // Auto-clear expired session
    logout();
    return false;
  }
  return true;
}

/**
 * Get the current user object from localStorage.
 */
export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  return getUser();
}

/**
 * Get the current auth token.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Save auth session (token + user).
 */
export function login(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

/**
 * Clear all auth & Spotify session data.
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SPOTIFY_TOKEN_KEY);
  localStorage.removeItem(SPOTIFY_REFRESH_KEY);
}

/**
 * Get Spotify access token from localStorage.
 */
export function getSpotifyToken() {
  return localStorage.getItem(SPOTIFY_TOKEN_KEY);
}

/**
 * Save Spotify tokens.
 */
export function saveSpotifyTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem(SPOTIFY_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(SPOTIFY_REFRESH_KEY, refreshToken);
}

/**
 * Clear Spotify tokens.
 */
export function clearSpotifyTokens() {
  localStorage.removeItem(SPOTIFY_TOKEN_KEY);
  localStorage.removeItem(SPOTIFY_REFRESH_KEY);
}
