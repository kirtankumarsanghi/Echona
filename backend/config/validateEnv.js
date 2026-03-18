function hasValue(value) {
  return typeof value === "string" ? value.trim() !== "" : value !== undefined && value !== null;
}

function isStrictMode(config) {
  return config.nodeEnv === "production" || config.nodeEnv === "staging" || process.env.STRICT_ENV === "true";
}

function validateDistinctPorts(config) {
  const portMap = {
    BACKEND_PORT: config.backendPort,
    FRONTEND_PORT: config.frontendPort,
    ML_PORT: config.mlPort,
  };
  const seen = {};
  const conflicts = [];

  for (const [name, port] of Object.entries(portMap)) {
    if (seen[port]) {
      conflicts.push(`${name} (${port}) conflicts with ${seen[port]}`);
    } else {
      seen[port] = name;
    }
  }

  if (conflicts.length > 0) {
    throw new Error(`Port conflict detected:\n  - ${conflicts.join("\n  - ")}\n  Each service must use a unique port.`);
  }
}

function validateJwt(config, errors, warnings) {
  // JWT removed — app now uses Google OAuth + express-session
  const weakSecrets = new Set([
    "echona_dev_session_secret_change_in_production",
    "secret",
    "session_secret",
    "change_this",
  ]);

  if (!hasValue(config.sessionSecret)) {
    if (config.nodeEnv === "development") {
      warnings.push("SESSION_SECRET not set — using development fallback. Set a strong secret for production.");
      return;
    }
    errors.push("SESSION_SECRET is required.");
    return;
  }

  if (isStrictMode(config) && weakSecrets.has(config.sessionSecret)) {
    errors.push("SESSION_SECRET is weak/default. Set a strong random secret before running in production/staging.");
  } else if (weakSecrets.has(config.sessionSecret)) {
    warnings.push("SESSION_SECRET is using a default value. Set a strong secret for production.");
  }

  if (!hasValue(config.googleClientId)) {
    if (isStrictMode(config)) {
      errors.push("GOOGLE_CLIENT_ID is required for Google OAuth.");
    } else {
      warnings.push("GOOGLE_CLIENT_ID not set — Google sign-in will not work.");
    }
  }

  if (!hasValue(config.googleClientSecret)) {
    if (isStrictMode(config)) {
      errors.push("GOOGLE_CLIENT_SECRET is required for Google OAuth.");
    } else {
      warnings.push("GOOGLE_CLIENT_SECRET not set — Google sign-in will not work.");
    }
  }
}

function validateAuth(_config, _errors) {
  // auth is handled via Google OAuth + session — nothing additional to validate here
}

function validateSpotify(config, errors, warnings) {
  const looksLikePlaceholder = (value) => {
    if (!hasValue(value)) {
      return false;
    }
    const v = String(value).toLowerCase();
    return (
      v.includes("your_") ||
      v.includes("change_me") ||
      v.includes("example") ||
      v.includes("client_id") ||
      v.includes("client_secret") ||
      v.includes("spotify_client") ||
      v.includes("dummy")
    );
  };

  const hasId = hasValue(config.spotifyClientId);
  const hasSecret = hasValue(config.spotifyClientSecret);
  const hasRedirect = hasValue(config.spotifyRedirectUri);

  // Check for partial configuration (likely a mistake)
  const configuredCount = [hasId, hasSecret, hasRedirect].filter(Boolean).length;

  if (configuredCount === 0) {
    warnings.push("Spotify credentials not configured. Spotify features will degrade gracefully with fallback UI.");
    return;
  }

  if (configuredCount < 3) {
    const missing = [];
    if (!hasId) missing.push("SPOTIFY_CLIENT_ID");
    if (!hasSecret) missing.push("SPOTIFY_CLIENT_SECRET");
    if (!hasRedirect) missing.push("SPOTIFY_REDIRECT_URI");

    // Always warn instead of error - Spotify is optional
    warnings.push(`Spotify partially configured. Missing: ${missing.join(", ")}. Spotify features will be unavailable.`);
    return;
  }

  if (looksLikePlaceholder(config.spotifyClientId) || looksLikePlaceholder(config.spotifyClientSecret)) {
    warnings.push(
      "Spotify credentials appear to be placeholder values. /api/spotify/health will fail with invalid_client until real credentials are set."
    );
  }
}

function validateMongo(config, warnings, errors) {
  if (!hasValue(config.mongoUri)) {
    // MongoDB is optional - warn in all modes
    warnings.push("MONGODB_URI not set — using in-memory storage. Data will not persist across restarts.");
  }
}

function validateEnvironment(config) {
  const errors = [];
  const warnings = [];

  validateDistinctPorts(config);
  validateJwt(config, errors, warnings);
  validateAuth(config, errors);
  validateSpotify(config, errors, warnings);
  validateMongo(config, warnings, errors);

  // Log configuration summary
  console.log("\n┌─────────────────────────────────────────┐");
  console.log("│       ECHONA Configuration Summary       │");
  console.log("├─────────────────────────────────────────┤");
  console.log(`│  Environment : ${config.nodeEnv.padEnd(24)}│`);
  console.log(`│  Backend     : port ${String(config.backendPort).padEnd(19)}│`);
  console.log(`│  Frontend    : port ${String(config.frontendPort).padEnd(19)}│`);
  console.log(`│  ML Service  : port ${String(config.mlPort).padEnd(19)}│`);
  console.log(`│  MongoDB     : ${hasValue(config.mongoUri) ? "configured".padEnd(24) : "in-memory (demo)".padEnd(24)}│`);
  console.log(`│  Spotify     : ${(hasValue(config.spotifyClientId) ? "configured" : "not configured").padEnd(24)}│`);
  console.log(`│  Weather     : ${(hasValue(config.weatherApiKey) ? "configured" : "not configured").padEnd(24)}│`);
  console.log("└─────────────────────────────────────────┘\n");

  if (errors.length > 0) {
    const message = `\n❌ Environment validation FAILED:\n  - ${errors.join("\n  - ")}\n`;
    console.error(message);
    throw new Error(message);
  }

  if (warnings.length > 0) {
    warnings.forEach((w) => console.warn(`⚠️  [ENV] ${w}`));
    console.log("");
  }
}

module.exports = { validateEnvironment };
