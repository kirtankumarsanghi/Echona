const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { verifyGoogleToken } = require("../services/authService");

// In-memory user fallback when MongoDB is unavailable
let inMemoryUsers = [];

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

function safeUser(user) {
  return {
    id: user._id?.toString() || user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
}

// ─── Health Check ───────────────────────────────────────────────────────────
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "auth",
    status: "ok",
    storage: useMongo() ? "mongodb" : "in-memory",
    mode: "google-oauth",
    timestamp: new Date().toISOString(),
  });
});

// ─── Google OAuth — exchange credential for session ────────────────────────
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body || {};
    if (!credential) {
      return res.status(400).json({ success: false, error: "Missing Google credential" });
    }

    const payload = await verifyGoogleToken(credential);

    const googleId = payload.sub;
    const name = payload.name || "";
    const email = (payload.email || "").toLowerCase().trim();
    const avatar = payload.picture || "";

    if (!email) {
      return res.status(400).json({ success: false, error: "Could not retrieve email from Google account" });
    }

    let user;
    if (useMongo()) {
      // Upsert: create on first login, update lastLogin on subsequent ones
      user = await User.findOneAndUpdate(
        { googleId },
        {
          $set: { name, email, avatar, lastLogin: new Date() },
          $setOnInsert: { googleId, createdAt: new Date() },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      const idx = inMemoryUsers.findIndex((u) => u.googleId === googleId);
      if (idx >= 0) {
        inMemoryUsers[idx].lastLogin = new Date();
        inMemoryUsers[idx].name = name;
        inMemoryUsers[idx].avatar = avatar;
        user = inMemoryUsers[idx];
      } else {
        user = {
          id: `user_${Date.now()}`,
          googleId,
          name,
          email,
          avatar,
          createdAt: new Date(),
          lastLogin: new Date(),
          moodHistory: [],
        };
        inMemoryUsers.push(user);
      }
    }

    // Set session
    req.session.userId = user._id?.toString() || user.id;
    req.session.email = email;
    await new Promise((resolve, reject) =>
      req.session.save((err) => (err ? reject(err) : resolve()))
    );

    console.log("[Auth] ✓ Google login:", email);
    return res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    console.error("[Auth] Google auth error:", err.message);
    return res.status(401).json({
      success: false,
      error: "Google authentication failed",
      message: err.message,
    });
  }
});

// ─── Me — check active session ──────────────────────────────────────────────
router.get("/me", async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, authenticated: false });
  }

  try {
    let user;
    if (useMongo()) {
      user = await User.findById(userId).select("-__v");
    } else {
      user = inMemoryUsers.find((u) => (u._id?.toString() || u.id) === userId);
    }

    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ success: false, authenticated: false });
    }

    return res.json({ success: true, authenticated: true, user: safeUser(user) });
  } catch (err) {
    console.error("[Auth] /me error:", err.message);
    req.session.destroy(() => {});
    return res.status(401).json({
      success: false,
      authenticated: false,
      error: "Session unavailable",
      message: "Session store temporarily unavailable. Please sign in again.",
    });
  }
});

// ─── Logout ─────────────────────────────────────────────────────────────────
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: "Logout failed" });
    }
    res.clearCookie("echona_sid");
    return res.json({ success: true, message: "Logged out successfully" });
  });
});

// ─── Legacy signup endpoint — removed (Google OAuth only) ──────────────────
// This stub prevents 404s if any old client still calls it
router.post("/signup", (req, res) => {
  return res.status(410).json({
    success: false,
    error: "Removed",
    message: "Email/password sign-up has been removed. Please use Google Sign-In.",
  });
});

module.exports = router;
