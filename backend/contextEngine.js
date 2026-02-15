const { getWeatherContext } = require("./services/weatherService");

async function getContext() {
  /* =========================
     1️⃣ TIME CONTEXT
  ========================= */
  const hour = new Date().getHours();
  let timeContext = "neutral";

  if (hour >= 5 && hour < 12) {
    timeContext = "morning";
  } else if (hour >= 12 && hour < 17) {
    timeContext = "afternoon";
  } else if (hour >= 17 && hour < 22) {
    timeContext = "evening";
  } else {
    timeContext = "night";
  }

  /* =========================
     2️⃣ WEATHER CONTEXT
  ========================= */
  const weather = await getWeatherContext();
  const weatherContext = weather.weatherContext;
  const temperature = weather.temperature;

  /* =========================
     FINAL CONTEXT OBJECT
  ========================= */
  return {
    timeContext,
    weatherContext,
    temperature,
    weatherSource: weather.source,
    weatherWarning: weather.warning,
    timestamp: new Date().toISOString()
  };
}

module.exports = getContext;
