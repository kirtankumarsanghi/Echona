const fetch = require("node-fetch");
const config = require("../config");

const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const WEATHER_RETRIES = 2;

function mapWeatherContext(rawWeather) {
  const weather = String(rawWeather || "clear").toLowerCase();
  if (weather.includes("rain") || weather.includes("drizzle")) return "rainy";
  if (weather.includes("cloud")) return "cloudy";
  if (weather.includes("clear") || weather.includes("sun")) return "sunny";
  if (weather.includes("snow")) return "snowy";
  if (weather.includes("storm") || weather.includes("thunder")) return "stormy";
  return weather;
}

const FALLBACK_RESULT = {
  weatherContext: "clear",
  temperature: null,
  source: "fallback",
};

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function getWeatherContext() {
  if (!config.weatherApiKey) {
    return {
      ...FALLBACK_RESULT,
      warning: "WEATHER_API_KEY is not configured",
    };
  }

  const timeoutMs = config.requestTimeoutMs || 10000;
  let lastError;

  for (let attempt = 0; attempt <= WEATHER_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(
        `${WEATHER_URL}?q=${encodeURIComponent(config.weatherCity)}&appid=${config.weatherApiKey}&units=metric`,
        timeoutMs
      );

      if (!response.ok) {
        throw new Error(`Weather API responded with ${response.status}`);
      }

      const data = await response.json();
      const rawWeather = data?.weather?.[0]?.main || "clear";

      return {
        weatherContext: mapWeatherContext(rawWeather),
        temperature: data?.main?.temp ?? null,
        source: "openweather",
      };
    } catch (error) {
      lastError = error;
      if (attempt < WEATHER_RETRIES) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }
  }

  console.warn("[Weather] All retries failed, using fallback:", lastError?.message);
  return {
    ...FALLBACK_RESULT,
    warning: lastError?.message || "Weather service unavailable",
  };
}

module.exports = { getWeatherContext, mapWeatherContext };
