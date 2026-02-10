// Minimal ECHONA Backend - No Login Required
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory mood storage
let moods = [];
let moodIdCounter = 1;

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "ECHONA Backend API - DEMO MODE",
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// Add mood
app.post("/api/mood/add", (req, res) => {
  const { mood, score } = req.body;
  
  if (!mood) {
    return res.status(400).json({ error: "Mood is required" });
  }
  
  const log = {
    _id: moodIdCounter++,
    mood,
    score: score || 5,
    createdAt: new Date()
  };
  
  moods.push(log);
  console.log("✅ Mood saved:", mood);
  res.json({ message: "Mood saved", log });
});

// Get mood history
app.get("/api/mood/history", (req, res) => {
  res.json(moods);
});

// Get mood stats
app.get("/api/mood/stats", (req, res) => {
  const total = moods.length;
  const moodCounts = {};
  
  moods.forEach(m => {
    moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
  });
  
  const mostCommon = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0] || "None";
  
  res.json({
    total,
    mostCommon,
    moodDistribution: moodCounts
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ECHONA Backend running on http://localhost:${PORT}`);
  console.log(`ℹ️  DEMO MODE - No database, no authentication required`);
});
