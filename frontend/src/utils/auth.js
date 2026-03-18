const USER_KEY = "echona_user";
const SPOTIFY_TOKEN_KEY = "spotify_token";
const SPOTIFY_REFRESH_KEY = "spotify_refresh_token";

/**
 * Returns true if the user object is cached in localStorage.
 * Actual session validity is confirmed server-side via /api/auth/me.
 */
export function isLoggedIn() {
  return getUser() !== null;
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
 * Persist user profile locally (session cookie is managed by the browser).
 */
export function saveUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Clear user profile and Spotify tokens.
 */
export function clearUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SPOTIFY_TOKEN_KEY);
  localStorage.removeItem(SPOTIFY_REFRESH_KEY);
}

/** @deprecated Use saveUser() instead (kept for backward compat) */
export function login(_token, user) {
  saveUser(user);
}

/** @deprecated Use clearUser() instead (kept for backward compat) */
export function logout() {
  clearUser();
}

/** @deprecated No longer used — auth is session-based */
export function getToken() {
  return null;
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
 * Get Spotify refresh token from localStorage.
 */
export function getSpotifyRefreshToken() {
  return localStorage.getItem(SPOTIFY_REFRESH_KEY);
}

/**
 * Clear Spotify tokens.
 */
export function clearSpotifyTokens() {
  localStorage.removeItem(SPOTIFY_TOKEN_KEY);
  localStorage.removeItem(SPOTIFY_REFRESH_KEY);
}
