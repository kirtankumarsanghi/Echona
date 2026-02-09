const express = require("express");
const router = express.Router();
const Mood = require("../models/Mood.js");
const { authMiddleware } = require("../middleware/authMiddleware");

// Add mood log
router.post("/add", authMiddleware, async (req, res) => {
  try {
    console.log("[MoodRoutes] POST /add called");
    console.log("[MoodRoutes] User:", req.user);
    console.log("[MoodRoutes] Body:", req.body);
    
    const { mood, score } = req.body;

    if (!mood) {
      return res.status(400).json({ error: "Mood is required" });
    }

    const log = await Mood.create({
      userId: req.user.id,
      mood,
      score,
    });

    console.log("[MoodRoutes] Mood created:", log);
    res.json({ message: "Mood saved", log });
  } catch (err) {
    console.error("[MoodRoutes] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all moods for user
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const history = await Mood.find({ userId: req.user.id }).sort({
      createdAt: 1,
    });

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get mood statistics
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all moods
    const allMoods = await Mood.find({ userId }).sort({ createdAt: -1 });
    
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
    const mostCommon = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b, Object.keys(moodCounts)[0] || "None");
    
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

// Add mood with note
router.post("/add-note", authMiddleware, async (req, res) => {
  try {
    const { mood, note, score, intensity, tags } = req.body;

    if (!mood) {
      return res.status(400).json({ error: "Mood is required" });
    }

    const log = await Mood.create({
      userId: req.user.id,
      mood,
      note: note || "",
      score: score || 5,
      intensity: intensity || 5,
      tags: tags || [],
    });

    res.json({ message: "Mood with note saved", log });
  } catch (err) {
    console.error("[MoodRoutes] Add note error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete mood
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const mood = await Mood.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!mood) {
      return res.status(404).json({ error: "Mood not found" });
    }

    res.json({ message: "Mood deleted", mood });
  } catch (err) {
    console.error("[MoodRoutes] Delete error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Analyze text and detect mood using AI
router.post("/analyze-text", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Use Python AI engine to analyze text
    const { spawn } = require("child_process");
    const path = require("path");
    
    const pythonScript = path.join(__dirname, "../../ai-engine/analyze.py");
    const python = spawn("python", [pythonScript, text]);

    let result = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        console.error("[MoodRoutes] Python error:", errorOutput);
        return res.status(500).json({ 
          error: "AI analysis failed",
          details: errorOutput 
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
          mood: detectedMood,
          confidence: analysis.sentiment_score,
          intensity: analysis.intensity,
          emotions: analysis.emotion_distribution
        });
      } catch (parseErr) {
        console.error("[MoodRoutes] Parse error:", parseErr);
        res.status(500).json({ 
          error: "Failed to parse AI response",
          details: result 
        });
      }
    });

  } catch (err) {
    console.error("[MoodRoutes] Analyze text error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
