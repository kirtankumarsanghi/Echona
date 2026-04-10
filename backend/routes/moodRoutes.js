const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const config = require("../config");

let Mood;
try {
  Mood = require("../models/mood");
} catch {
  Mood = null;
}

// In-memory storage partitioned by user/session key (capped per user)
const MAX_MOODS = 500;
const moodStoreByUser = new Map();
const moodIdCountersByUser = new Map();

const ALLOWED_MOODS = new Set(["Happy", "Sad", "Angry", "Calm", "Excited", "Anxious", "Stressed", "Lonely", "Tired", "Neutral"]);

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
  if (lowered === "stressed") return "Stressed";
  if (lowered === "lonely") return "Lonely";
  if (lowered === "tired") return "Tired";
  if (lowered === "neutral") return "Neutral";

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
  if (/(happy|great|good|awesome|joy|cheerful)/.test(value)) return "Happy";
  if (/(sad|down|depressed|cry|upset|heartbroken)/.test(value)) return "Sad";
  if (/(angry|mad|furious|annoyed|rage|irritated)/.test(value)) return "Angry";
  if (/(anxious|worried|nervous|panic|uneasy)/.test(value)) return "Anxious";
  if (/(stressed|overwhelmed|pressure|burnout|tense)/.test(value)) return "Stressed";
  if (/(lonely|alone|isolated|miss|abandoned)/.test(value)) return "Lonely";
  if (/(tired|exhausted|sleepy|fatigued|drained|bored)/.test(value)) return "Tired";
  if (/(excited|thrilled|pumped|hyped|energetic)/.test(value)) return "Excited";
  if (/(calm|peaceful|relax|chill|serene)/.test(value)) return "Calm";
  return "Neutral";
}

function useMongoMoodStore(req) {
  return Boolean(Mood)
    && mongoose.connection.readyState === 1
    && Boolean(req?.session?.userId)
    && mongoose.Types.ObjectId.isValid(String(req.session.userId));
}

function toSerializableMoodLog(doc) {
  if (!doc) return null;
  return {
    _id: doc._id?.toString() || doc.id,
    userId: doc.userId?.toString?.() || doc.userId,
    mood: doc.mood,
    score: Number(doc.score) || 0,
    note: doc.note || "",
    intensity: Number(doc.intensity) || undefined,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function getHistory(req) {
  if (useMongoMoodStore(req)) {
    const docs = await Mood.find({ userId: req.session.userId })
      .sort({ createdAt: -1 })
      .limit(MAX_MOODS)
      .lean();
    return docs.map(toSerializableMoodLog);
  }
  return sortedActorHistory(req);
}

async function clearHistoryStore(req) {
  if (useMongoMoodStore(req)) {
    await Mood.deleteMany({ userId: req.session.userId });
    return;
  }
  setActorMoods(req, []);
}

function getActorKey(req) {
  if (req?.session?.userId) {
    return `user:${req.session.userId}`;
  }

  // Keep anonymous users isolated per browser/session cookie when available.
  const sid = req?.sessionID ? String(req.sessionID) : "";
  if (sid) {
    return `anon:${sid}`;
  }

  const ip = req?.ip || "global";
  return `ip:${ip}`;
}

function getActorMoods(req) {
  const key = getActorKey(req);
  if (!moodStoreByUser.has(key)) {
    moodStoreByUser.set(key, []);
  }
  return moodStoreByUser.get(key);
}

function setActorMoods(req, items) {
  const key = getActorKey(req);
  moodStoreByUser.set(key, items.slice(-MAX_MOODS));
}

function nextActorMoodId(req) {
  const key = getActorKey(req);
  const next = (moodIdCountersByUser.get(key) || 0) + 1;
  moodIdCountersByUser.set(key, next);
  return next;
}

function sortedActorHistory(req) {
  return [...getActorMoods(req)].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

    let log;

    if (useMongoMoodStore(req)) {
      const created = await Mood.create({
        userId: req.session.userId,
        mood: normalizedMood,
        score: parseScore(score),
      });
      log = toSerializableMoodLog(created);
    } else {
      log = {
        _id: nextActorMoodId(req),
        userId: "anonymous",
        mood: normalizedMood,
        score: parseScore(score),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const actorMoods = getActorMoods(req);
      actorMoods.push(log);
      setActorMoods(req, actorMoods);
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
    const history = await getHistory(req);
    res.json(history);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Backward-compatible alias used by some components
router.get("/", async (req, res) => {
  try {
    const history = await getHistory(req);
    res.json(history);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get mood statistics (no authentication required)
router.get("/stats", async (req, res) => {
  try {
    const allMoods = await getHistory(req);
    
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

    let log;

    if (useMongoMoodStore(req)) {
      const created = await Mood.create({
        userId: req.session.userId,
        mood: normalizedMood,
        note: note || "",
        score: parseScore(score),
        intensity: parseScore(intensity),
        tags: Array.isArray(tags) ? tags : [],
      });
      log = toSerializableMoodLog(created);
    } else {
      log = {
        _id: nextActorMoodId(req),
        userId: "anonymous",
        mood: normalizedMood,
        note: note || "",
        score: parseScore(score),
        intensity: parseScore(intensity),
        tags: Array.isArray(tags) ? tags : [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const actorMoods = getActorMoods(req);
      actorMoods.push(log);
      setActorMoods(req, actorMoods);
    }

    res.json({ success: true, message: "Mood with note saved", log });
  } catch (err) {
    console.error("[MoodRoutes] Add note error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete mood (no authentication required)
router.delete("/:id", async (req, res) => {
  try {
    const rawId = String(req.params.id || "").trim();
    let mood;

    if (useMongoMoodStore(req)) {
      if (!mongoose.Types.ObjectId.isValid(rawId)) {
        return res.status(400).json({ success: false, error: "Mood id must be a valid ObjectId" });
      }

      const deleted = await Mood.findOneAndDelete({
        _id: rawId,
        userId: req.session.userId,
      }).lean();

      if (!deleted) {
        return res.status(404).json({ success: false, error: "Mood not found" });
      }
      mood = toSerializableMoodLog(deleted);
    } else {
      const moodId = parseInt(rawId, 10);
      if (!Number.isInteger(moodId)) {
        return res.status(400).json({ success: false, error: "Mood id must be a number" });
      }

      const actorMoods = getActorMoods(req);
      const moodIndex = actorMoods.findIndex((m) => m._id === moodId);

      if (moodIndex === -1) {
        return res.status(404).json({ success: false, error: "Mood not found" });
      }

      mood = actorMoods[moodIndex];
      actorMoods.splice(moodIndex, 1);
      setActorMoods(req, actorMoods);
    }

    res.json({ success: true, message: "Mood deleted", mood });
  } catch (err) {
    console.error("[MoodRoutes] Delete error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Clear current user/session mood history
router.post("/clear", async (req, res) => {
  try {
    await clearHistoryStore(req);
    res.json({ success: true, message: "Mood history cleared" });
  } catch (err) {
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
          "angry": "Angry",
          "stressed": "Stressed",
          "anxious": "Anxious",
          "lonely": "Lonely",
          "tired": "Tired",
          "romantic": "Excited",
          "excited": "Excited",
          "calm": "Calm",
          "neutral": "Neutral",
          "random": "Neutral"
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
