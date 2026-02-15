const express = require("express");
const router = express.Router();

// In-memory storage (demo mode) — capped to prevent memory leak
const MAX_USERS = 200;
let userScores = {};

// 🎮 Submit challenge result
router.post("/submit", (req, res) => {
  const { user = "demo", correct } = req.body || {};
  const safeUser = String(user || "demo").trim().slice(0, 40) || "demo";

  if (typeof correct !== "boolean") {
    return res.status(400).json({
      success: false,
      error: "Field 'correct' must be boolean",
    });
  }

  // Cap number of tracked users
  const userKeys = Object.keys(userScores);
  if (!userScores[safeUser] && userKeys.length >= MAX_USERS) {
    // Evict oldest user
    delete userScores[userKeys[0]];
  }

  if (!userScores[safeUser]) {
    userScores[safeUser] = {
      score: 0,
      badges: []
    };
  }

  if (correct) {
    userScores[safeUser].score += 10;
  }

  // Badge logic
  if (
    userScores[safeUser].score >= 50 &&
    !userScores[safeUser].badges.includes("Music Explorer")
  ) {
    userScores[safeUser].badges.push("Music Explorer");
  }

  res.json({
    success: true,
    score: userScores[safeUser].score,
    badges: userScores[safeUser].badges
  });
});

// 📊 Get score for a user
router.get("/score", (req, res) => {
  const user = String(req.query.user || "demo").trim().slice(0, 40) || "demo";
  const data = userScores[user] || { score: 0, badges: [] };
  res.json({ success: true, user, ...data });
});

module.exports = router;
