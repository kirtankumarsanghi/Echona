const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config");

const BCRYPT_ROUNDS = 12;
const AUTH_TOKEN_TTL = config.authTokenTtl;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function buildAuthTokenPayload(user) {
  return {
    id: user._id || user.id,
    email: user.email,
  };
}

function createAccessToken(user) {
  if (!config.jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(buildAuthTokenPayload(user), config.jwtSecret, {
    expiresIn: AUTH_TOKEN_TTL,
    issuer: "echona",
  });
}

function verifyAccessToken(token) {
  if (!config.jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.verify(token, config.jwtSecret, { issuer: "echona" });
}

/**
 * Decode token without verifying signature.
 * Useful to check expiry on the client-side without the secret.
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
}

async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  normalizeEmail,
  createAccessToken,
  verifyAccessToken,
  decodeToken,
  hashPassword,
  comparePassword,
};
