const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const config = require("../config");
// const Mood = require("../models/Mood.js");

// In-memory storage for demo mode (capped to prevent memory leak)
const MAX_MOODS = 500;
let moods = [];
let moodIdCounter = 1;

const ALLOWED_MOODS = new Set(["Happy", "Sad", "Angry", "Calm", "Excited", "Anxious"]);

function normalizeMood(rawMood) {
  const value = String(rawMood || "").trim();
  if (!value) {
    return null;
  }

  const lowered = value.toLowerCase();
  if (lowered === "happy") return "Happy";
  if (lowered === "sad") return "Sad";
  if (lowered === "angry") return "Angry";
  if (lowered === "calm") return "Calm";
  if (lowered === "excited") return "Excited";
  if (lowered === "anxious") return "Anxious";

  return ALLOWED_MOODS.has(value) ? value : null;
}

function parseScore(rawScore, fallback = 5) {
  const parsed = Number(rawScore);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const rounded = Math.round(parsed);
  return Math.min(10, Math.max(0, rounded));
}

function quickTextMoodFallback(text) {
  const value = String(text || "").toLowerCase();
  if (/(happy|great|good|awesome|excited|joy)/.test(value)) return "Happy";
  if (/(sad|down|depressed|cry|upset)/.test(value)) return "Sad";
  if (/(angry|mad|furious|annoyed)/.test(value)) return "Angry";
  if (/(anxious|worried|stress|nervous|panic)/.test(value)) return "Anxious";
  if (/(calm|peaceful|relax|chill)/.test(value)) return "Calm";
  return "Calm";
}

// Add mood log (no authentication required)
router.post("/add", async (req, res) => {
  try {
    console.log("[MoodRoutes] POST /add called");
    console.log("[MoodRoutes] Body:", req.body);
    
    const { mood, score } = req.body || {};
    const normalizedMood = normalizeMood(mood);

    if (!normalizedMood) {
      return res.status(400).json({
        success: false,
        error: "Valid mood is required",
        allowedMoods: Array.from(ALLOWED_MOODS),
      });
    }

    // Use in-memory storage
    const log = {
      _id: moodIdCounter++,
      userId: "anonymous",
      mood: normalizedMood,
      score: parseScore(score),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    moods.push(log);
    // Evict oldest entries if over cap
    if (moods.length > MAX_MOODS) {
      moods = moods.slice(-MAX_MOODS);
    }

    console.log("[MoodRoutes] Mood created:", log);
    res.json({ success: true, message: "Mood saved", log });
  } catch (err) {
    console.error("[MoodRoutes] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all moods (no authentication required)
router.get("/history", async (req, res) => {
  try {
    // Return in-memory moods sorted by creation date
    const history = [...moods].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(history);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get mood statistics (no authentication required)
router.get("/stats", async (req, res) => {
  try {
    // Get all moods from memory (copy to avoid in-place mutation)
    const allMoods = [...moods].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Calculate stats
    const total = allMoods.length;
    
    // This week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = allMoods.filter(m => new Date(m.createdAt) >= weekAgo).length;
    
    // Most common mood
    const moodCounts = {};
    allMoods.forEach(m => {
      moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    });
    const moodKeys = Object.keys(moodCounts);
    const mostCommon = moodKeys.length
      ? moodKeys.reduce((a, b) => (moodCounts[a] > moodCounts[b] ? a : b), moodKeys[0])
      : "None";
    
    // Calculate streak (consecutive days with mood entries)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let checkDate = new Date(today);
    const moodDates = new Set(allMoods.map(m => {
      const d = new Date(m.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }));
    
    while (moodDates.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    res.json({
      total,
      thisWeek,
      mostCommon,
      streak,
      moodDistribution: moodCounts,
    });
  } catch (err) {
    console.error("[MoodRoutes] Stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add mood with note (no authentication required)
router.post("/add-note", async (req, res) => {
  try {
    const { mood, note, score, intensity, tags } = req.body;
    const normalizedMood = normalizeMood(mood);

    if (!normalizedMood) {
      return res.status(400).json({
        success: false,
        error: "Valid mood is required",
        allowedMoods: Array.from(ALLOWED_MOODS),
      });
    }

    const log = {
      _id: moodIdCounter++,
      userId: "anonymous",
      mood: normalizedMood,
      note: note || "",
      score: parseScore(score),
      intensity: parseScore(intensity),
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    moods.push(log);

    res.json({ success: true, message: "Mood with note saved", log });
  } catch (err) {
    console.error("[MoodRoutes] Add note error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete mood (no authentication required)
router.delete("/:id", async (req, res) => {
  try {
    const moodId = parseInt(req.params.id);
    if (!Number.isInteger(moodId)) {
      return res.status(400).json({ success: false, error: "Mood id must be a number" });
    }
    const moodIndex = moods.findIndex(m => m._id === moodId);
    
    if (moodIndex === -1) {
      return res.status(404).json({ success: false, error: "Mood not found" });
    }
    
    const mood = moods[moodIndex];
    moods.splice(moodIndex, 1);

    res.json({ success: true, message: "Mood deleted", mood });
  } catch (err) {
    console.error("[MoodRoutes] Delete error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Analyze text and detect mood using AI (no authentication required)
router.post("/analyze-text", async (req, res) => {
  try {
    const { text } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }

    // Limit text length to prevent abuse
    const safeText = String(text).slice(0, 2000).trim();

    // Use Python AI engine to analyze text
    const pythonScript = path.join(__dirname, "../../ai-engine/analyze.py");
    if (!fs.existsSync(pythonScript)) {
      return res.json({
        success: true,
        mood: quickTextMoodFallback(text),
        confidence: 0.45,
        intensity: 0.5,
        emotions: {},
        source: "fallback",
      });
    }

    const python = spawn("python", [pythonScript, safeText]);

    let result = "";
    let errorOutput = "";
    let finished = false;

    const timeout = setTimeout(() => {
      if (finished) {
        return;
      }
      finished = true;
      python.kill();
      return res.status(504).json({
        success: false,
        error: "AI analysis timeout",
      });
    }, config.mlTimeoutMs || 12000);

    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timeout);

      if (code !== 0) {
        console.error("[MoodRoutes] Python error:", errorOutput);
        return res.status(503).json({
          success: false,
          error: "AI analysis failed",
        });
      }

      try {
        const analysis = JSON.parse(result);
        console.log("[MoodRoutes] AI Analysis result:", analysis);
        
        // Map AI mood to our mood categories
        const moodMap = {
          "happy": "Happy",
          "sad": "Sad",
          "anger": "Angry",
          "stressed": "Anxious",
          "romantic": "Excited",
          "excited": "Excited",
          "random": "Calm"
        };

        const detectedMood = moodMap[analysis.mood] || "Calm";
        
        res.json({
          success: true,
          mood: detectedMood,
          confidence: analysis.sentiment_score,
          intensity: analysis.intensity,
          emotions: analysis.emotion_distribution
        });
      } catch (parseErr) {
        console.error("[MoodRoutes] Parse error:", parseErr, "Raw:", result);
        res.status(500).json({ 
          success: false,
          error: "Failed to parse AI response",
        });
      }
    });

    python.on("error", (spawnErr) => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timeout);
      console.error("[MoodRoutes] Python spawn error:", spawnErr);
      return res.status(503).json({
        success: false,
        error: "AI engine unavailable",
      });
    });

  } catch (err) {
    console.error("[MoodRoutes] Analyze text error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
