const fetch = require("node-fetch");

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
  const city = "Delhi"; // Can be made dynamic later
  const apiKey = process.env.WEATHER_API_KEY || "your_api_key_here";

  let weatherContext = "clear";
  let temperature = null;

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.weather && data.weather.length > 0) {
      const weather = data.weather[0].main.toLowerCase();
      temperature = data.main?.temp;

      // Map weather conditions to contexts
      if (weather.includes("rain") || weather.includes("drizzle")) {
        weatherContext = "rainy";
      } else if (weather.includes("cloud")) {
        weatherContext = "cloudy";
      } else if (weather.includes("clear") || weather.includes("sun")) {
        weatherContext = "sunny";
      } else if (weather.includes("snow")) {
        weatherContext = "snowy";
      } else if (weather.includes("storm") || weather.includes("thunder")) {
        weatherContext = "stormy";
      } else {
        weatherContext = weather;
      }
    }
  } catch (error) {
    console.warn("⚠️  Weather API failed:", error.message, "- using default clear weather");
    weatherContext = "clear";
  }

  /* =========================
     FINAL CONTEXT OBJECT
  ========================= */
  return {
    timeContext,
    weatherContext,
    temperature,
    timestamp: new Date().toISOString()
  };
}

module.exports = getContext;
