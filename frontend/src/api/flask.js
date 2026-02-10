import axios from "axios";

const FLASK_BASE_URL = "http://127.0.0.1:5000";

/**
 * Analyze mood using Flask ML backend
 * Supports: text, image (base64), audio (base64)
 */
export async function analyzeWithFlask(payload) {
  try {
    const res = await axios.post(
      `${FLASK_BASE_URL}/analyze`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("[Flask API Error]", error.response?.data || error.message);
    throw error;
  }
}
