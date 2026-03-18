import axiosInstance from "./axiosInstance";

function normalizeMoodPayload(data = {}) {
  return {
    ...data,
    mood: data.mood || data.emotion || null,
  };
}

async function postMl(path, payload) {
  try {
    const res = await axiosInstance.post(path, payload);
    return normalizeMoodPayload(res.data || {});
  } catch (error) {
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
