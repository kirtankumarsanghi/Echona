const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const {
  normalizeEmail,
  createAccessToken,
  verifyAccessToken,
  hashPassword,
  comparePassword,
} = require("../services/authService");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_NAME_LENGTH = 100;

// In-memory user storage (fallback when MongoDB is unavailable)
let inMemoryUsers = [];

// Try to load User model, fallback to in-memory if MongoDB not available
let User;
try {
  User = require("../models/User");
} catch (err) {
  console.warn("⚠️  User model unavailable — using in-memory auth");
  User = null;
}

function useMongo() {
  return Boolean(User) && mongoose.connection.readyState === 1;
}

function sanitizeUser(user) {
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
  };
}

// ─── Health Check ───────────────────────────────────────────────────────────
router.get("/health", (req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    service: "auth",
    status: "ok",
    storage: mongoReady ? "mongodb" : "in-memory",
    jwtConfigured: true,
    timestamp: new Date().toISOString(),
  });
});

// ─── Token Verify (for frontend to check token validity) ────────────────────
router.get("/verify", (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return res.status(401).json({
        success: false,
        valid: false,
        error: "No token provided",
      });
    }

    const decoded = verifyAccessToken(token);
    return res.json({
      success: true,
      valid: true,
      user: { id: decoded.id, email: decoded.email },
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
    });
  } catch (err) {
    const isExpired = err.name === "TokenExpiredError";
    return res.status(401).json({
      success: false,
      valid: false,
      expired: isExpired,
      error: isExpired ? "Token expired" : "Invalid token",
    });
  }
});

// ─── Signup ─────────────────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    const normalizedName = String(name || "").trim();
    const normalizedEmail = normalizeEmail(email);

    // Validation
    const errors = [];
    if (!normalizedName) errors.push("Full name is required");
    else if (normalizedName.length > MAX_NAME_LENGTH) errors.push(`Name must be under ${MAX_NAME_LENGTH} characters`);
    if (!normalizedEmail) errors.push("Email is required");
    else if (!EMAIL_REGEX.test(normalizedEmail)) errors.push("Please provide a valid email address");
    if (!password) errors.push("Password is required");
    else if (password.length < MIN_PASSWORD_LENGTH) errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        message: errors[0],
        details: errors,
      });
    }

    // Hash password using centralized service
    const hashedPassword = await hashPassword(password);

    let user;
    if (useMongo()) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "Account exists",
          message: "An account with this email already exists. Please sign in instead.",
        });
      }

      user = await User.create({
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
      });
    } else {
      const existingUser = inMemoryUsers.find((u) => u.email === normalizedEmail);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "Account exists",
          message: "An account with this email already exists. Please sign in instead.",
        });
      }

      user = {
        _id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
      };
      inMemoryUsers.push(user);
    }

    const token = createAccessToken(user);
    console.log("[Auth] ✓ User registered:", normalizedEmail);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("[Auth] Signup error:", err.message);

    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "Account exists",
        message: "An account with this email already exists.",
      });
    }

    res.status(500).json({
      success: false,
      error: "Registration failed",
      message: "Unable to create account at the moment. Please try again.",
    });
  }
});

// ─── Login ──────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    // Validation
    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        message: "Email and password are required",
      });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        message: "Please provide a valid email address",
      });
    }

    let user;
    if (useMongo()) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = inMemoryUsers.find((u) => u.email === normalizedEmail);
    }

    if (!user) {
      // Dummy bcrypt compare to prevent timing-based user enumeration
      await comparePassword(password, "$2a$10$dummyhashtopreventtimingattackxxxxxxxxxx");
      return res.status(401).json({
        success: false,
        error: "Authentication failed",
        message: "Invalid email or password",
      });
    }

    // Verify password using centralized service
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Authentication failed",
        message: "Invalid email or password",
      });
    }

    const token = createAccessToken(user);
    console.log("[Auth] ✓ User logged in:", normalizedEmail);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("[Auth] Login error:", err.message);
    res.status(500).json({
      success: false,
      error: "Login failed",
      message: "Unable to complete login at the moment. Please try again.",
    });
  }
});

module.exports = router;
