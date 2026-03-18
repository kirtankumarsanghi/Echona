const express = require("express");
const mongoose = require("mongoose");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

let User;
try {
  User = require("../models/User");
} catch {
  User = null;
}

const memoryWellnessStore = new Map();

const VALID_HABITS = ["sleep", "hydration", "exercise", "social", "screenLimit"];

function useMongo() {
  return Boolean(User) && mongoose.connection.readyState === 1;
}

function normalizeHabits(input) {
  const safe = {};
  if (!input || typeof input !== "object") return safe;
  for (const key of VALID_HABITS) safe[key] = Boolean(input[key]);
  return safe;
}

function getDefaultState() {
  return {
    habitsByDate: {},
    copilotConversation: [],
    moodTimeline: [],
  };
}

async function getUserWellnessState(userId) {
  if (useMongo()) {
    const user = await User.findById(userId).select("wellnessData");
    if (!user) return getDefaultState();
    return {
      ...getDefaultState(),
      ...(user.wellnessData?.toObject ? user.wellnessData.toObject() : user.wellnessData || {}),
    };
  }

  return memoryWellnessStore.get(userId) || getDefaultState();
}

async function saveUserWellnessState(userId, nextState) {
  const safeState = {
    habitsByDate: nextState.habitsByDate || {},
    copilotConversation: (nextState.copilotConversation || []).slice(-200),
    moodTimeline: (nextState.moodTimeline || []).slice(-1000),
  };

  if (useMongo()) {
    await User.findByIdAndUpdate(userId, { $set: { wellnessData: safeState } }, { new: true });
    return;
  }

  memoryWellnessStore.set(userId, safeState);
}

function scoreToZone(score) {
  if (score < 4.8) return "Dip risk";
  if (score < 7) return "Balanced";
  return "Uplift";
}

function hourSuggestion(zone, hour) {
  if (zone === "Dip risk") {
    if (hour < 12) return "Start with hydration + 2-minute breathing before work.";
    if (hour < 18) return "Take a short reset walk and reduce task switching.";
    return "Lower stimulation, calming music, and short reflection.";
  }
  if (zone === "Balanced") {
    return "Protect momentum with one focused block and a quick check-in.";
  }
  return "Great window for high-value work and social connection.";
}

function buildForecast(moodTimeline) {
  const now = new Date();
  const last60d = moodTimeline.filter((entry) => {
    const d = new Date(entry.createdAt);
    return Number.isFinite(d.getTime()) && now - d <= 60 * 24 * 60 * 60 * 1000;
  });

  const buckets = Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }));
  for (const entry of last60d) {
    const d = new Date(entry.createdAt);
    const hour = d.getHours();
    const score = Number(entry.score);
    if (Number.isFinite(score) && score >= 0 && score <= 10) {
      buckets[hour].sum += score;
      buckets[hour].count += 1;
    }
  }

  const baseline = last60d.length
    ? last60d.reduce((sum, e) => sum + Number(e.score || 0), 0) / last60d.length
    : 5.8;

  const forecast = [];
  for (let offset = 0; offset < 24; offset += 1) {
    const hour = (now.getHours() + offset) % 24;
    const bucket = buckets[hour];
    const avg = bucket.count ? bucket.sum / bucket.count : baseline;
    const zone = scoreToZone(avg);
    forecast.push({
      hour,
      label: `${String(hour).padStart(2, "0")}:00`,
      avgScore: Number(avg.toFixed(1)),
      zone,
      confidence: bucket.count >= 4 ? "high" : bucket.count >= 2 ? "medium" : "low",
      suggestion: hourSuggestion(zone, hour),
    });
  }

  const riskWindows = forecast.filter((f) => f.zone === "Dip risk").slice(0, 4);
  return {
    baseline: Number(baseline.toFixed(1)),
    riskWindows,
    timeline: forecast,
    generatedAt: new Date().toISOString(),
  };
}

router.use(authMiddleware);

router.get("/state", async (req, res) => {
  try {
    const state = await getUserWellnessState(req.user.id);
    const forecast = buildForecast(state.moodTimeline || []);
    return res.json({ success: true, state, forecast });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/habits", async (req, res) => {
  try {
    const { date, habits } = req.body || {};
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
      return res.status(400).json({ success: false, error: "Valid date is required (YYYY-MM-DD)" });
    }

    const state = await getUserWellnessState(req.user.id);
    state.habitsByDate = state.habitsByDate || {};
    state.habitsByDate[date] = normalizeHabits(habits);
    await saveUserWellnessState(req.user.id, state);

    return res.json({ success: true, habitsByDate: state.habitsByDate });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/copilot", async (req, res) => {
  try {
    const { role, text } = req.body || {};
    if (!["user", "assistant"].includes(role)) {
      return res.status(400).json({ success: false, error: "Role must be user or assistant" });
    }
    const safeText = String(text || "").trim().slice(0, 1200);
    if (!safeText) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }

    const state = await getUserWellnessState(req.user.id);
    state.copilotConversation = state.copilotConversation || [];
    state.copilotConversation.push({ role, text: safeText, createdAt: new Date().toISOString() });
    state.copilotConversation = state.copilotConversation.slice(-200);
    await saveUserWellnessState(req.user.id, state);

    return res.json({ success: true, conversation: state.copilotConversation });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/mood-sync", async (req, res) => {
  try {
    const { history } = req.body || {};
    if (!Array.isArray(history)) {
      return res.status(400).json({ success: false, error: "History array is required" });
    }

    const normalized = history
      .map((entry) => ({
        mood: String(entry.mood || "").trim().slice(0, 40),
        score: Math.max(0, Math.min(10, Number(entry.score) || 0)),
        createdAt: new Date(entry.createdAt || Date.now()).toISOString(),
      }))
      .filter((entry) => entry.mood && Number.isFinite(entry.score))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const state = await getUserWellnessState(req.user.id);
    state.moodTimeline = normalized.slice(-1000);
    await saveUserWellnessState(req.user.id, state);

    return res.json({ success: true, synced: state.moodTimeline.length, forecast: buildForecast(state.moodTimeline) });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
