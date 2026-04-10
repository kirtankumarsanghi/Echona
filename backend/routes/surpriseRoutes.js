const express = require("express");
const axios = require("axios");
const config = require("../config");

const getContext = require("../contextEngine");
const mapContextToMood = require("../contextToMood");
const mapEmotionToMood = require("../emotionToMood");

const router = express.Router();

function normalizeMoodLabel(mood) {
  const value = String(mood || "Neutral").trim();
  if (!value) return "Neutral";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

async function fetchMlRecommendation(finalMood) {
  try {
    const response = await axios.get(`${config.mlServiceUrl}/recommend`, {
      params: {
        emotion: finalMood,
        count: 1,
      },
      timeout: config.requestTimeoutMs || 12000,
    });

    const payload = response.data || {};
    const first = Array.isArray(payload.songs) ? payload.songs[0] : null;
    if (!first) return null;

    return {
      title: first.title || first.name || "Recommended Track",
      artist: first.artist || "Unknown Artist",
      genre: first.genre || "Unknown",
      energy: first.energy || payload?.therapy?.energy || "medium",
      source: "ml-recommend",
    };
  } catch {
    return null;
  }
}

function toYoutubeSearchUrl(track = {}) {
  const query = `${track.title || ""} ${track.artist || ""}`.trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query || "music")}`;
}

async function buildDynamicTrack(finalMood) {
  const ml = await fetchMlRecommendation(finalMood);
  if (ml) {
    return {
      ...ml,
      youtubeUrl: toYoutubeSearchUrl(ml),
    };
  }

  return {
    title: `${finalMood} Playlist Mix`,
    artist: "YouTube Music",
    genre: "Mixed",
    source: "generated-fallback",
    youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${finalMood} mood playlist`)}`,
  };
}

/**
 * � GET - Context-Aware Surprise (No ML Emotion)
 */
router.get("/", async (req, res) => {
  try {
    // 1️⃣ Get context (time + weather)
    const { timeContext, weatherContext } = await getContext();
    
    // 2️⃣ Map context to mood
    const finalMood = normalizeMoodLabel(mapContextToMood(timeContext, weatherContext));
    const selectedSong = await buildDynamicTrack(finalMood);

    res.json({
      success: true,
      context: {
        time: timeContext,
        weather: weatherContext,
        moodUsed: finalMood
      },
      track: selectedSong,
    });
  } catch (error) {
    console.error("Context-aware surprise error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate context-aware surprise"
    });
  }
});

/**
 * � POST - Emotion + Context Aware Surprise (PHASE 4: ML Integrated)
 * 
 * Priority: Emotion > Context
 * - If ML detected emotion exists → use it
 * - If neutral or no emotion → fallback to context
 */
router.post("/", async (req, res) => {
  try {
    // 👇 emotion already predicted by ML (from face/voice/text)
    const { mlEmotion } = req.body || {}; // e.g. "happy", "sad", "anxious"
    const safeEmotion = mlEmotion ? String(mlEmotion).trim().toLowerCase() : undefined;

    // 1️⃣ Context-based mood (time + weather)
    const { timeContext, weatherContext } = await getContext();
    const contextMood = mapContextToMood(
      timeContext,
      weatherContext
    );

    // 2️⃣ Emotion-based mood (from ML)
    const emotionMood = mapEmotionToMood(safeEmotion);

    // 3️⃣ Final decision (emotion takes priority if available)
    const finalMoodRaw =
      emotionMood !== "neutral"
        ? emotionMood
        : contextMood;
    const finalMood = normalizeMoodLabel(finalMoodRaw);

    console.log(`Phase 4: ML Emotion="${safeEmotion || "none"}" -> Mood="${emotionMood}", Context Mood="${contextMood}", Final="${finalMood}"`);

    // 4️⃣ Select live track recommendation
    const selectedSong = await buildDynamicTrack(finalMood);

    res.json({
      success: true,
      mlEmotion: safeEmotion || null, // Show user what emotion was detected
      contextMood, // Show context fallback mood
      context: { // Match GET route structure
        time: timeContext,
        weather: weatherContext,
        moodUsed: finalMood
      },
      track: selectedSong,
    });
  } catch (error) {
    console.error("❌ Emotion-aware surprise error:", error);
    res.status(500).json({
      success: false,
      error: "Emotion-aware surprise failed"
    });
  }
});

module.exports = router;
