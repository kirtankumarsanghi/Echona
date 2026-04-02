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
const ALLOWED_TONES = ["calm", "coach", "direct"];

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

function sanitizeTone(tone) {
  const normalized = String(tone || "calm").trim().toLowerCase();
  return ALLOWED_TONES.includes(normalized) ? normalized : "calm";
}

function fallbackCopilotReply({ message, mood, trendLabel, tone }) {
  const text = String(message || "").trim().toLowerCase();
  const compact = text.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const safeTone = sanitizeTone(tone);

  const stylePrefix =
    safeTone === "direct"
      ? "Direct plan:"
      : safeTone === "coach"
        ? "You can handle this."
        : "I hear you.";

  if (!compact) {
    return `${stylePrefix} Share one clear sentence about what happened and how you feel.`;
  }

  if (/(suicid|kill myself|self harm|hurt myself|end my life)/.test(compact)) {
    return "I am really glad you shared this. Please contact your local emergency number right now if you might act on these thoughts, and reach out to a trusted person to stay with you while you get immediate support.";
  }

  if (/^(hi|hello|hey)\b/.test(compact)) {
    return `${stylePrefix} Tell me what is hardest right now in one line, and I will help with a practical next step.`;
  }

  if (/(how are you|who are you|what can you do)/.test(compact)) {
    return "I am here to support your wellbeing. I can help you understand what you are feeling and choose sensible next actions for the next 15-30 minutes.";
  }

  if (/(overwhelm|overwhelmed|stress|deadline|pressure|panic|anxious|anxiety)/.test(compact)) {
    return `${stylePrefix} Try this now: 1) choose one must-do task, 2) do 2 minutes of slow breathing, 3) run one 25-minute focus block with notifications off.`;
  }

  if (/(sad|down|low|empty|lonely|hopeless|crying)/.test(compact)) {
    return `${stylePrefix} Gentle reset: 1) 5-10 minutes of movement, 2) write one honest sentence about what hurts, 3) message one trusted person.`;
  }

  if (/(angry|frustrat|irritat|mad|rage)/.test(compact)) {
    return `${stylePrefix} De-escalate first: pause for 90 seconds, relax jaw and shoulders, then write one clear boundary or request.`;
  }

  if (/(tired|drain|exhaust|sleepy|fatigue|burnout|burned out)/.test(compact)) {
    return `${stylePrefix} Restore energy now: hydrate, do one low-effort 10-minute task, then schedule a short break.`;
  }

  if (/(happy|great|good|better|excited|motivated|confident|grateful)/.test(compact)) {
    return `${stylePrefix} Great momentum. Lock it in with one high-value task and note what helped your mood today.`;
  }

  if (compact.length < 10) {
    return "I want to understand properly. Tell me what happened, how you feel, and what kind of help you want right now.";
  }

  return `${stylePrefix} Based on your current context (mood: ${mood || "Unknown"}, trend: ${trendLabel || "Unknown"}), choose one 5-minute action now and review how you feel after 15 minutes.`;
}

async function generateCopilotReply({ message, mood, trendLabel, tone, conversation }) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const safeTone = sanitizeTone(tone);

  if (!apiKey) {
    return { text: fallbackCopilotReply({ message, mood, trendLabel, tone: safeTone }), source: "rules" };
  }

  const toneInstruction =
    safeTone === "direct"
      ? "Be concise and practical. Give 2-3 clear actions."
      : safeTone === "coach"
        ? "Be encouraging and action-oriented."
        : "Be calm, warm, and grounded.";

  const systemPrompt = [
    "You are a mental wellness support copilot.",
    "You are not a therapist and must not claim diagnosis.",
    "Keep responses practical, empathetic, and specific to user text.",
    "Avoid generic templates and mirror the user's concern.",
    "If there is self-harm intent, advise immediate emergency and trusted-contact support.",
    toneInstruction,
  ].join(" ");

  const recent = Array.isArray(conversation)
    ? conversation
        .slice(-8)
        .map((item) => ({
          role: item.role === "assistant" ? "assistant" : "user",
          content: String(item.text || "").slice(0, 800),
        }))
    : [];

  try {
    const response = await require("axios").post(
      "https://api.openai.com/v1/chat/completions",
      {
        model,
        temperature: 0.6,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "system", content: `Context mood: ${mood || "Unknown"}, trend: ${trendLabel || "Unknown"}, tone: ${safeTone}` },
          ...recent,
          { role: "user", content: String(message || "").slice(0, 1200) },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 9000,
      }
    );

    const llmText = response?.data?.choices?.[0]?.message?.content;
    const cleaned = String(llmText || "").trim();
    if (cleaned) {
      return { text: cleaned.slice(0, 1500), source: "llm" };
    }
  } catch {
    // Fall back to deterministic local logic when LLM call fails.
  }

  return { text: fallbackCopilotReply({ message, mood, trendLabel, tone: safeTone }), source: "rules" };
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

router.post("/copilot/reply", async (req, res) => {
  try {
    const { message, mood, trendLabel, tone, conversation } = req.body || {};
    const safeMessage = String(message || "").trim().slice(0, 1200);
    if (!safeMessage) {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const result = await generateCopilotReply({
      message: safeMessage,
      mood: String(mood || "Neutral").slice(0, 40),
      trendLabel: String(trendLabel || "Steady").slice(0, 40),
      tone,
      conversation: Array.isArray(conversation) ? conversation : [],
    });

    return res.json({
      success: true,
      reply: result.text,
      source: result.source,
      tone: sanitizeTone(tone),
    });
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
