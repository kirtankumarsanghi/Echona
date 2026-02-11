const express = require("express");
const router = express.Router();

// In-memory storage (demo mode)
let userScores = {};

// 🎮 Submit challenge result
router.post("/submit", (req, res) => {
  const { user = "demo", correct } = req.body;

  if (!userScores[user]) {
    userScores[user] = {
      score: 0,
      badges: []
    };
  }

  if (correct) {
    userScores[user].score += 10;
  }

  // Badge logic
  if (
    userScores[user].score >= 50 &&
    !userScores[user].badges.includes("Music Explorer")
  ) {
    userScores[user].badges.push("Music Explorer");
  }

  res.json({
    success: true,
    score: userScores[user].score,
    badges: userScores[user].badges
  });
});

module.exports = router;
