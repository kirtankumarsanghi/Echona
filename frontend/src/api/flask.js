import axiosInstance from "./axiosInstance";

/**
 * Analyze mood using Flask ML backend
 * Supports: text, image (base64), audio (base64)
 */
export async function analyzeWithFlask(payload) {
  try {
    const res = await axiosInstance.post("/api/ml/analyze", payload);

    return res.data || {};
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

export async function checkFlaskHealth() {
  try {
    const res = await axiosInstance.get("/api/ml/health");
    return res.data;
  } catch (error) {
    console.warn("[Flask Health] ML service unreachable:", error.message);
    return { success: false, error: "ML service unavailable" };
  }
}
