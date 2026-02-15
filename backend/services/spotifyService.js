const SpotifyWebApi = require("spotify-web-api-node");
const config = require("../config");

const SPOTIFY_TIMEOUT_MS = config.spotifyTimeoutMs || 10000;
const MAX_RETRIES = Math.min(config.maxRetries || 3, 3);

const baseConfig = {
  clientId: config.spotifyClientId,
  clientSecret: config.spotifyClientSecret,
  redirectUri: config.spotifyRedirectUri,
};

const clientCredentialsApi = new SpotifyWebApi(baseConfig);
let clientTokenExpiry = 0;

function isSpotifyConfigured() {
  return Boolean(config.spotifyClientId && config.spotifyClientSecret && config.spotifyRedirectUri);
}

function getUserApi(accessToken) {
  const api = new SpotifyWebApi(baseConfig);
  if (accessToken) {
    api.setAccessToken(accessToken);
  }
  return api;
}

function mapSpotifyError(error, fallbackMessage = "Spotify request failed") {
  const status = Number(error?.statusCode || error?.response?.statusCode || error?.response?.status) || 502;

  if (status === 401) {
    return { statusCode: 401, error: "Spotify token expired", message: "Reconnect Spotify to continue." };
  }
  if (status === 403) {
    return { statusCode: 403, error: "Spotify forbidden", message: "This action requires Spotify Premium or proper permissions." };
  }
  if (status === 404) {
    return { statusCode: 404, error: "Spotify resource unavailable", message: "Spotify resource not found or device unavailable." };
  }
  if (status === 429) {
    return { statusCode: 429, error: "Spotify rate limited", message: "Spotify rate limit hit. Please retry shortly." };
  }

  return {
    statusCode: status >= 400 && status < 600 ? status : 502,
    error: "Spotify upstream error",
    message: error?.message || fallbackMessage,
  };
}

function parseRetryAfter(error) {
  const retryAfter = error?.headers?.["retry-after"] || error?.response?.headers?.["retry-after"];
  const seconds = Number(retryAfter);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 500;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, timeoutMs, operationName) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject({
        statusCode: 504,
        error: "Spotify timeout",
        message: `${operationName} timed out after ${timeoutMs}ms`,
      });
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function executeWithRetry(operation, options = {}) {
  const retries = options.retries ?? 1;
  const fallbackMessage = options.fallbackMessage;
  const timeoutMs = options.timeoutMs ?? SPOTIFY_TIMEOUT_MS;
  const operationName = options.operationName || "Spotify operation";

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await withTimeout(operation(), timeoutMs, operationName);
    } catch (error) {
      lastError = error;
      const status = Number(error?.statusCode || error?.response?.statusCode || error?.response?.status);
      const isRetryable = status === 429 || !status || (status >= 500 && status < 600);

      if (!isRetryable || attempt === retries) {
        break;
      }

      const backoffMs = status === 429 ? parseRetryAfter(error) : 300 * (attempt + 1);
      await sleep(backoffMs);
    }
  }

  throw mapSpotifyError(lastError, fallbackMessage);
}

async function ensureClientCredentials() {
  const now = Date.now();
  if (now < clientTokenExpiry) {
    return clientCredentialsApi;
  }

  const grant = await executeWithRetry(() => clientCredentialsApi.clientCredentialsGrant(), {
    retries: 2,
    fallbackMessage: "Failed to obtain Spotify client credentials",
  });

  const accessToken = grant.body.access_token;
  const expiresIn = Number(grant.body.expires_in || 3600);

  clientCredentialsApi.setAccessToken(accessToken);
  clientTokenExpiry = now + Math.max(expiresIn - 60, 60) * 1000;

  return clientCredentialsApi;
}

async function refreshAccessToken(refreshToken) {
  const api = getUserApi();
  api.setRefreshToken(refreshToken);

  const data = await executeWithRetry(() => api.refreshAccessToken(), {
    retries: 1,
    fallbackMessage: "Unable to refresh Spotify token",
  });

  return {
    access_token: data.body.access_token,
    expires_in: data.body.expires_in,
  };
}

async function searchTracks(query, userToken) {
  if (userToken) {
    try {
      const userApi = getUserApi(userToken);
      const data = await executeWithRetry(() => userApi.searchTracks(query, { limit: 10 }), {
        retries: 1,
        fallbackMessage: "User-token Spotify search failed",
      });
      return data.body;
    } catch (error) {
      if (error.statusCode !== 401 && error.statusCode !== 403) {
        throw error;
      }
    }
  }

  const api = await ensureClientCredentials();
  const data = await executeWithRetry(() => api.searchTracks(query, { limit: 10 }), {
    retries: 2,
    fallbackMessage: "Spotify search unavailable",
  });

  return data.body;
}

async function getServiceHealth() {
  if (!isSpotifyConfigured()) {
    return {
      success: false,
      status: "degraded",
      configured: false,
      message: "Spotify credentials are missing",
    };
  }

  try {
    await ensureClientCredentials();
    return {
      success: true,
      status: "ok",
      configured: true,
      timeoutMs: SPOTIFY_TIMEOUT_MS,
      message: "Spotify service ready",
    };
  } catch (error) {
    return {
      success: false,
      status: "degraded",
      configured: true,
      timeoutMs: SPOTIFY_TIMEOUT_MS,
      error: error.error || "Spotify health check failed",
      message: error.message || "Spotify health check failed",
    };
  }
}

module.exports = {
  isSpotifyConfigured,
  getUserApi,
  mapSpotifyError,
  executeWithRetry,
  refreshAccessToken,
  searchTracks,
  getServiceHealth,
};
