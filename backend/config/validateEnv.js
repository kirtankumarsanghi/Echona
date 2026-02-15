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
  if (!hasValue(config.jwtSecret)) {
    // In dev mode, use a fallback to prevent crash
    if (config.nodeEnv === "development") {
      warnings.push("JWT_SECRET not set — using development fallback. Set a proper secret for production.");
      return;
    }
    errors.push("JWT_SECRET is required.");
    return;
  }

  const weakSecrets = new Set([
    "change_this_jwt_secret",
    "your_super_secret_jwt_key_change_this_in_production",
    "secret",
    "jwt_secret",
    "change_this_to_a_strong_random_secret",
    "replace_with_strong_secret",
  ]);

  if (isStrictMode(config) && weakSecrets.has(config.jwtSecret)) {
    errors.push("JWT_SECRET is weak/default. Set a strong secret before running in production/staging.");
  } else if (weakSecrets.has(config.jwtSecret)) {
    warnings.push("JWT_SECRET is using a default value. Set a strong secret for production.");
  }
}

function validateAuth(config, errors) {
  if (!hasValue(config.authTokenTtl)) {
    errors.push("AUTH_TOKEN_TTL is required.");
  }
}

function validateSpotify(config, errors, warnings) {
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

    if (isStrictMode(config)) {
      errors.push(`Spotify partially configured. Missing: ${missing.join(", ")}`);
    } else {
      warnings.push(`Spotify partially configured. Missing: ${missing.join(", ")}. Spotify features will be unavailable.`);
    }
  }
}

function validateMongo(config, warnings, errors) {
  if (!hasValue(config.mongoUri)) {
    if (isStrictMode(config)) {
      errors.push("MONGODB_URI is required in production/staging.");
    } else {
      warnings.push("MONGODB_URI not set — using in-memory storage. Data will not persist across restarts.");
    }
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
