import axios from "axios";
import { clearUser } from "../utils/auth";

// In production set VITE_API_URL to the backend URL; leave empty for Vite proxy
const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "";

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getHeader(headers, key) {
  if (!headers) return undefined;
  return headers[key] || headers[key.toLowerCase()] || headers[key.toUpperCase()];
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: API_BASE_URL ? 60000 : 15000,
  // CRITICAL: send session cookie on every request
  withCredentials: true,
});

// ─── Request interceptor: inject CSRF token ────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    // CSRF double-submit: read csrf_token cookie and echo it in header
    const csrfCookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("csrf_token="));
    if (csrfCookie) {
      config.headers["X-CSRF-Token"] = csrfCookie.split("=")[1];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: error normalization, retry, auto-logout ────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const status = error.response?.status;
    const responseData = error.response?.data || {};
    const isNetworkError = !error.response;
    const isTimeout = error.code === "ECONNABORTED";
    const isServerError = status >= 500 && status < 600;
    const isRateLimited = status === 429;
    const isSafeMethod = ["get", "head", "options"].includes(
      (config.method || "get").toLowerCase()
    );
    const isRetryableRoute = String(config.url || "").includes("/api/spotify/search");
    const canRetryMethod = isSafeMethod || isRetryableRoute;

    // ─── Automatic retry for transient failures ─────────────────────────
    if (
      (isNetworkError || isTimeout || isServerError || isRateLimited) &&
      canRetryMethod
    ) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < MAX_RETRIES) {
        config.__retryCount += 1;

        const retryAfter = Number(
          getHeader(error.response?.headers, "retry-after")
        );
        const retryDelay =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : RETRY_BASE_DELAY * config.__retryCount;

        await sleep(retryDelay);
        return axiosInstance(config);
      }
    }

    // ─── Network error (backend unreachable) ────────────────────────────
    if (isNetworkError) {
      // Better message for production cold starts
      if (API_BASE_URL) {
        error.message =
          "Server is waking up (this takes 30-60 seconds on first load). Please wait and try again...";
      } else {
        error.message =
          "Cannot connect to server. Please check if the backend is running.";
      }
      error.userFriendly = true;
      return Promise.reject(error);
    }

    // ─── Auto logout on 401 for protected routes ────────────────────────
    if (status === 401) {
      const url = String(config.url || "");
      const isAuthRoute = url.includes("/api/auth/");
      const isSpotifyRoute = url.includes("/api/spotify/");
      const isMlRoute = url.includes("/api/ml/");
      const isHealthRoute = url.includes("/health");

      const isExpiredSession =
        responseData.code === "NO_SESSION" ||
        responseData.error === "Authentication required";

      if (
        !isAuthRoute &&
        !isSpotifyRoute &&
        !isMlRoute &&
        !isHealthRoute
      ) {
        // Session is gone — clear local user cache and redirect
        clearUser();

        if (
          window.location.pathname !== "/auth" &&
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/"
        ) {
          window.location.href = "/auth";
          return Promise.reject(error);
        }
      }

      if (isExpiredSession) {
        error.message = "Your session has expired. Please sign in again.";
        error.userFriendly = true;
      }
    }

    // ─── Normalize error messages from server ───────────────────────────
    if ([400, 401, 403, 404, 409, 422, 429, 503].includes(status)) {
      const requestId =
        responseData.requestId ||
        getHeader(error.response?.headers, "x-request-id");
      const serverMessage = responseData.message || responseData.error;
      if (serverMessage) {
        error.message = serverMessage;
        error.userFriendly = true;
      }
    }

    if (status === 503) {
      error.message =
        responseData.message ||
        "Service temporarily unavailable. Please try again in a moment.";
      error.userFriendly = true;
    }

    if (status === 504) {
      error.message = "Request timed out. Please try again.";
      error.userFriendly = true;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
