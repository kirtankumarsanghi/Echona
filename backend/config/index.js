const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { validateEnvironment } = require("./validateEnv");

// Load .env — try backend/.env first, then root .env as fallback
const backendEnvPath = path.resolve(__dirname, "../.env");
const rootEnvPath = path.resolve(__dirname, "../../.env");

if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  console.warn("[Config] No .env file found — using defaults + environment variables");
}

function readSharedServiceConfig() {
  const configPath = path.resolve(__dirname, "../../service-config.json");
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {
      ports: { frontend: 3000, backend: 5000, ml: 5001 },
      hosts: { frontend: "http://localhost", backend: "http://localhost", ml: "http://127.0.0.1" },
      timeouts: { request: 12000, ml: 15000, spotify: 10000, health: 4000 },
      retry: { maxAttempts: 3, baseDelayMs: 300 },
    };
  }
}

const shared = readSharedServiceConfig();
const defaultFrontendPort = Number(shared?.ports?.frontend) || 3000;
const defaultBackendPort = Number(shared?.ports?.backend) || 5000;
const defaultMlPort = Number(shared?.ports?.ml) || 5001;
const defaultMlHost = String(shared?.hosts?.ml || "http://127.0.0.1");

function parsePort(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseTimeout(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function sanitizeEnvString(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const hasWrappingDoubleQuotes = trimmed.startsWith('"') && trimmed.endsWith('"');
  const hasWrappingSingleQuotes = trimmed.startsWith("'") && trimmed.endsWith("'");
  if ((hasWrappingDoubleQuotes || hasWrappingSingleQuotes) && trimmed.length >= 2) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

const config = {
  // Environment
  nodeEnv: process.env.NODE_ENV || "development",

  // Ports (strict: env > service-config > hardcoded)
  // Render uses PORT, fallback to BACKEND_PORT
  backendPort: parsePort(process.env.PORT || process.env.BACKEND_PORT, defaultBackendPort),
  frontendPort: parsePort(process.env.FRONTEND_PORT, defaultFrontendPort),
  mlPort: parsePort(process.env.ML_PORT, defaultMlPort),

  // URLs
  frontendUrl: sanitizeEnvString(process.env.FRONTEND_URL) || `http://localhost:${defaultFrontendPort}`,
  // Smart default: use production ML service if NODE_ENV is production
  mlServiceUrl: sanitizeEnvString(process.env.ML_SERVICE_URL) ||
    (process.env.NODE_ENV === "production" 
      ? "https://echona-ml.onrender.com" 
      : `${defaultMlHost}:${defaultMlPort}`),

  // Database
  mongoUri: sanitizeEnvString(process.env.MONGODB_URI),

  // Weather
  weatherApiKey: sanitizeEnvString(process.env.WEATHER_API_KEY),
  weatherCity: sanitizeEnvString(process.env.WEATHER_CITY) || "Delhi",

  // Spotify
  spotifyClientId: sanitizeEnvString(process.env.SPOTIFY_CLIENT_ID),
  spotifyClientSecret: sanitizeEnvString(process.env.SPOTIFY_CLIENT_SECRET),
  spotifyRedirectUri:
    sanitizeEnvString(process.env.SPOTIFY_REDIRECT_URI) || `http://localhost:${defaultBackendPort}/api/spotify/callback`,

  // Auth — Google OAuth
  googleClientId: sanitizeEnvString(process.env.GOOGLE_CLIENT_ID),
  googleClientSecret: sanitizeEnvString(process.env.GOOGLE_CLIENT_SECRET),
  sessionSecret: sanitizeEnvString(process.env.SESSION_SECRET) || "echona_dev_session_secret_change_in_production",
  sessionMaxAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days

  // Timeouts
  requestTimeoutMs: parseTimeout(process.env.REQUEST_TIMEOUT_MS, shared?.timeouts?.request || 12000),
  mlTimeoutMs: parseTimeout(process.env.ML_TIMEOUT_MS, shared?.timeouts?.ml || 15000),
  spotifyTimeoutMs: parseTimeout(process.env.SPOTIFY_TIMEOUT_MS, shared?.timeouts?.spotify || 10000),
  healthTimeoutMs: parseTimeout(process.env.HEALTH_TIMEOUT_MS, shared?.timeouts?.health || 4000),

  // Retry
  maxRetries: Number(process.env.MAX_RETRIES) || shared?.retry?.maxAttempts || 3,
  retryBaseDelayMs: Number(process.env.RETRY_BASE_DELAY_MS) || shared?.retry?.baseDelayMs || 300,
};

validateEnvironment(config);

module.exports = config;
