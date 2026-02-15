const express = require("express");
const musicLibrary = require("../mockMusic");

const getContext = require("../contextEngine");
const mapContextToMood = require("../contextToMood");
const mapEmotionToMood = require("../emotionToMood");

const router = express.Router();

/**
 * � GET - Context-Aware Surprise (No ML Emotion)
 */
router.get("/", async (req, res) => {
  try {
    if (!Array.isArray(musicLibrary) || musicLibrary.length === 0) {
      return res.status(503).json({
        success: false,
        error: "Music library unavailable"
      });
    }

    // 1️⃣ Get context (time + weather)
    const { timeContext, weatherContext } = await getContext();
    
    // 2️⃣ Map context to mood
    const finalMood = mapContextToMood(timeContext, weatherContext);

    // 3️⃣ Select song
    const matchingSongs = musicLibrary.filter(
      (song) => song.mood === finalMood
    );

    const songPool =
      matchingSongs.length > 0
        ? matchingSongs
        : musicLibrary;

    const selectedSong =
      songPool[Math.floor(Math.random() * songPool.length)];

    res.json({
      success: true,
      context: {
        time: timeContext,
        weather: weatherContext,
        moodUsed: finalMood
      },
      track: selectedSong
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
    if (!Array.isArray(musicLibrary) || musicLibrary.length === 0) {
      return res.status(503).json({
        success: false,
        error: "Music library unavailable"
      });
    }

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
    const finalMood =
      emotionMood !== "neutral"
        ? emotionMood
        : contextMood;

    console.log(`Phase 4: ML Emotion="${safeEmotion || "none"}" -> Mood="${emotionMood}", Context Mood="${contextMood}", Final="${finalMood}"`);

    // 4️⃣ Select song from library
    const matchingSongs = musicLibrary.filter(
      (song) => song.mood === finalMood
    );

    const songPool =
      matchingSongs.length > 0
        ? matchingSongs
        : musicLibrary;

    const selectedSong =
      songPool[Math.floor(Math.random() * songPool.length)];

    res.json({
      success: true,
      mlEmotion: safeEmotion || null, // Show user what emotion was detected
      contextMood, // Show context fallback mood
      context: { // Match GET route structure
        time: timeContext,
        weather: weatherContext,
        moodUsed: finalMood
      },
      track: selectedSong
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
