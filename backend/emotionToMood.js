/**
 * 🎭 PHASE 4: Map ML Emotion to Music Mood
 * 
 * This is the core of emotion-aware music selection.
 * ML emotions (from face/voice/text) → Music moods
 */
function mapEmotionToMood(emotion) {
  // Normalize to lowercase
  const e = emotion ? emotion.toLowerCase() : "";

  // Map ML emotions to our 6 mood categories
  if (e === "happy" || e === "joy" || e === "excited") return "Happy";
  if (e === "sad" || e === "depressed" || e === "down") return "Sad";
  if (e === "angry" || e === "frustrated" || e === "annoyed") return "Angry";
  if (e === "calm" || e === "peaceful" || e === "relaxed") return "Calm";
  if (e === "anxious" || e === "nervous" || e === "worried") return "Anxious";
  if (e === "energetic" || e === "pumped" || e === "motivated") return "Excited";
  if (e === "neutral" || e === "normal") return "neutral"; // Will use context instead

  return "neutral"; // Fallback to context-based
}

module.exports = mapEmotionToMood;
