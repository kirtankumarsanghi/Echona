const express = require("express");
const axios = require("axios");
const config = require("../config");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postWithRetry(url, payload, options = {}) {
  const retries = options.retries ?? config.maxRetries ?? 2;
  const delayMs = options.delayMs ?? config.retryBaseDelayMs ?? 300;
  // Much longer timeout for production (ML service cold starts can take 90+ seconds)
  const timeout = config.nodeEnv === "production" ? 120000 : (options.timeout ?? config.mlTimeoutMs);

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await axios.post(url, payload, {
        timeout,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      lastError = error;
      const shouldRetry =
        !error.response ||
        error.code === "ECONNABORTED" ||
        error.code === "ECONNREFUSED" ||
        (error.response && error.response.status >= 500 && error.response.status < 600);

      if (!shouldRetry || attempt === retries) {
        break;
      }
      console.warn(`[ML Proxy] Attempt ${attempt + 1} failed, retrying in ${delayMs * (attempt + 1)}ms...`);
      await wait(delayMs * (attempt + 1));
    }
  }

  throw lastError;
}

router.get("/health", async (req, res) => {
  try {
    const response = await axios.get(`${config.mlServiceUrl}/health`, {
      timeout: config.healthTimeoutMs,
    });

    res.json({
      success: true,
      upstream: response.data,
      mlServiceUrl: config.mlServiceUrl,
    });
  } catch (error) {
    const isConnectionRefused = error.code === "ECONNREFUSED";
    res.status(503).json({
      success: false,
      error: "ML service unavailable",
      message: isConnectionRefused
        ? `ML service is not running. Start it on port ${config.mlPort}`
        : `ML service health check failed: ${error.message}`,
      mlServiceUrl: config.mlServiceUrl,
    });
  }
});

router.post("/analyze", authMiddleware, async (req, res) => {
  const { type, image, text } = req.body || {};

  if (!type || !["face", "text"].includes(type)) {
    return res.status(400).json({
      success: false,
      error: "Invalid analysis type",
      message: "type must be either 'face' or 'text'",
    });
  }

  if (type === "face" && !image) {
    return res.status(400).json({ success: false, error: "Image payload is required for face analysis" });
  }

  if (type === "text" && (!text || !String(text).trim())) {
    return res.status(400).json({ success: false, error: "Text payload is required for text analysis" });
  }

  try {
    const response = await postWithRetry(`${config.mlServiceUrl}/analyze`, req.body, {
      timeout: config.nodeEnv === "production" ? 120000 : config.requestTimeoutMs,
      retries: config.nodeEnv === "production" ? 3 : 2,
      delayMs: config.nodeEnv === "production" ? 3000 : 350,
    });

    res.json({
      success: true,
      ...response.data,
    });
  } catch (error) {
    const statusCode = error.response?.status || 503;
    const payload = error.response?.data;

    console.error("[ML Proxy] Analyze failed:", {
      statusCode,
      message: error.message,
      payload,
    });

    // Better error message for cold starts
    const errorMessage = config.nodeEnv === "production" && error.code === "ECONNABORTED"
      ? "ML service is still waking up (can take up to 2 minutes). Please try again shortly."
      : payload?.message || error.message;

    res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 503).json({
      success: false,
      error: payload?.error || "ML analysis unavailable",
      message: errorMessage,
    });
  }
});

module.exports = router;
