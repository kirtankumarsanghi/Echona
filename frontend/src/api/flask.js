import axios from "axios";
import axiosInstance from "./axiosInstance";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeMoodPayload(data = {}) {
  return {
    ...data,
    mood: data.mood || data.emotion || null,
  };
}

async function postMl(path, payload) {
  const isDetectionPath = /\/api\/ml\/(detect-face|detect-voice|detect-text|detect-multimodal|analyze)$/i.test(path);
  const timeout = isDetectionPath ? 90000 : undefined;
  try {
    const attempts = isDetectionPath ? 2 : 1;
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const res = await axiosInstance.post(path, payload, timeout ? { timeout } : undefined);
        return normalizeMoodPayload(res.data || {});
      } catch (err) {
        lastError = err;
        const status = err?.response?.status;
        const retryable = !status || status >= 500 || err?.code === "ECONNABORTED";
        if (!retryable || attempt === attempts) break;
        await sleep(350 * attempt);
      }
    }

    throw lastError;
  } catch (error) {
    const isDev = typeof import.meta !== "undefined" && import.meta.env?.DEV;
    const status = error?.response?.status;
    const canFallbackDirect = isDev && isDetectionPath && (!status || [401, 403, 422, 503, 504].includes(status));

    if (canFallbackDirect) {
      try {
        const directPath = path.replace(/^\/api\/ml/, "");
        const directRes = await axios.post(`http://127.0.0.1:5001${directPath}`, payload, {
          timeout: timeout || 90000,
          headers: { "Content-Type": "application/json" },
        });
        return normalizeMoodPayload(directRes.data || {});
      } catch (directError) {
        console.error("[Direct ML Fallback Error]", directError.response?.data || directError.message);
      }
    }

    console.error("[Flask API Error]", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "ML service unavailable"
    );
  }
}

export async function detectFace(payload) {
  return postMl("/api/ml/detect-face", payload);
}

export async function detectText(payload) {
  return postMl("/api/ml/detect-text", payload);
}

export async function detectVoice(payload) {
  return postMl("/api/ml/detect-voice", payload);
}

export async function detectMultimodal(payload) {
  return postMl("/api/ml/detect-multimodal", payload);
}

/**
 * Backward-compatible analyzer wrapper.
 * New code should prefer detectFace/detectText/detectVoice/detectMultimodal.
 */
export async function analyzeWithFlask(payload) {
  if (payload?.type === "face") {
    return detectFace({ image: payload.image });
  }

  if (payload?.type === "text") {
    return detectText({ text: payload.text });
  }

  return postMl("/api/ml/analyze", payload);
}

export async function checkFlaskHealth() {
  try {
    const res = await axiosInstance.get("/api/ml/health");
    return res.data;
  } catch (error) {
    console.warn("[Flask Health] ML service unreachable:", error.message);
    return { success: false, error: "ML service unavailable" };
  }
}
