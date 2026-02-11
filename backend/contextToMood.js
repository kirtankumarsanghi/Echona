/**
 * Maps time and weather context to appropriate mood
 * This creates intelligent, environment-aware music recommendations
 */
function mapContextToMood(timeContext, weatherContext) {
  // 🌧️ WEATHER PRIORITY (overrides time in some cases)
  if (weatherContext === "rainy" || weatherContext === "drizzle") {
    // Rainy weather → calm, acoustic vibes
    return "Calm";
  }

  if (weatherContext === "stormy" || weatherContext === "thunder") {
    // Stormy weather → intense/angry vibes
    return "Angry";
  }

  if (weatherContext === "snowy") {
    // Snowy weather → calm, peaceful
    return "Calm";
  }

  // ☀️ SUNNY WEATHER + TIME COMBINATIONS
  if (weatherContext === "sunny" || weatherContext === "clear") {
    if (timeContext === "morning") {
      return "Happy"; // Sunny morning → energetic, happy
    }
    if (timeContext === "afternoon") {
      return "Excited"; // Sunny afternoon → excited, active
    }
    if (timeContext === "evening") {
      return "Calm"; // Sunny evening → relaxing
    }
  }

  // ☁️ CLOUDY WEATHER + TIME
  if (weatherContext === "cloudy") {
    if (timeContext === "morning") {
      return "Calm"; // Cloudy morning → mellow start
    }
    if (timeContext === "night") {
      return "Sad"; // Cloudy night → melancholic
    }
    return "Calm"; // Default cloudy mood
  }

  // 🕐 TIME-BASED DEFAULTS (when weather is neutral)
  if (timeContext === "morning") {
    return "Excited"; // Morning energy
  }

  if (timeContext === "afternoon") {
    return "Happy"; // Midday positivity
  }

  if (timeContext === "evening") {
    return "Calm"; // Evening wind-down
  }

  if (timeContext === "night") {
    return "Calm"; // Night relaxation
  }

  // 🎯 ULTIMATE FALLBACK
  return "Happy"; // Default happy mood
}

module.exports = mapContextToMood;
