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
    profile: normalizeProfile(user.profile),
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
}

function normalizeProfile(profile = {}) {
  const dateValue = profile?.dateOfBirth ? new Date(profile.dateOfBirth) : null;
  const safeDate = dateValue && !Number.isNaN(dateValue.getTime())
    ? dateValue.toISOString().slice(0, 10)
    : "";

  return {
    username: String(profile?.username || "").trim(),
    dateOfBirth: safeDate,
    city: String(profile?.city || "").trim(),
    country: String(profile?.country || "").trim(),
    phone: String(profile?.phone || "").trim(),
    gender: String(profile?.gender || "").trim(),
    occupation: String(profile?.occupation || "").trim(),
    bio: String(profile?.bio || "").trim(),
  };
}

function parseIncomingProfile(input = {}) {
  const parsedDate = input?.dateOfBirth ? new Date(input.dateOfBirth) : null;
  if (parsedDate && Number.isNaN(parsedDate.getTime())) {
    return { error: "Invalid date of birth format" };
  }
  if (parsedDate && parsedDate > new Date()) {
    return { error: "Date of birth cannot be in the future" };
  }

  return {
    profile: {
      username: String(input?.username || "").trim().slice(0, 60),
      dateOfBirth: parsedDate || null,
      city: String(input?.city || "").trim().slice(0, 80),
      country: String(input?.country || "").trim().slice(0, 80),
      phone: String(input?.phone || "").trim().slice(0, 30),
      gender: String(input?.gender || "").trim().slice(0, 40),
      occupation: String(input?.occupation || "").trim().slice(0, 100),
      bio: String(input?.bio || "").trim().slice(0, 300),
    },
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
    return res.json({ success: true, authenticated: false, user: null });
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
      return res.json({ success: true, authenticated: false, user: null });
    }

    return res.json({ success: true, authenticated: true, user: safeUser(user) });
  } catch (err) {
    console.error("[Auth] /me error:", err.message);
    req.session.destroy(() => {});
    return res.status(200).json({
      success: true,
      authenticated: false,
      user: null,
      error: "Session unavailable",
      message: "Session store temporarily unavailable. Please sign in again.",
    });
  }
});

// ─── Profile — get current user profile details ───────────────────────────
router.get("/profile", async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }

  try {
    let user;
    if (useMongo()) {
      user = await User.findById(userId).select("name email avatar profile");
    } else {
      user = inMemoryUsers.find((u) => (u._id?.toString() || u.id) === userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({
      success: true,
      profile: {
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || "",
        ...normalizeProfile(user.profile),
      },
    });
  } catch (err) {
    console.error("[Auth] /profile GET error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to load profile" });
  }
});

// ─── Profile — update current user profile details ────────────────────────
router.put("/profile", async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }

  const { error, profile } = parseIncomingProfile(req.body || {});
  if (error) {
    return res.status(400).json({ success: false, error });
  }

  try {
    let user;
    if (useMongo()) {
      user = await User.findByIdAndUpdate(
        userId,
        { $set: { profile } },
        { new: true }
      ).select("name email avatar profile");
    } else {
      const idx = inMemoryUsers.findIndex((u) => (u._id?.toString() || u.id) === userId);
      if (idx >= 0) {
        inMemoryUsers[idx].profile = profile;
        user = inMemoryUsers[idx];
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const userPayload = safeUser(user);
    return res.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || "",
        ...normalizeProfile(user.profile),
      },
      user: userPayload,
    });
  } catch (err) {
    console.error("[Auth] /profile PUT error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to update profile" });
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
