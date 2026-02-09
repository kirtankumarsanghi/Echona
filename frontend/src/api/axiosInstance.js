import axios from "axios";

// Resolve API base URL: prefer Vite env var, fallback to localhost:5000
const API_BASE_URL = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : "http://localhost:5000";

console.log("[AxiosInstance] API_BASE_URL:", API_BASE_URL);

// Create axios instance with default config targeting backend
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
  validateStatus: function (status) {
    return status < 500; // Accept all responses below 500
  }
});

// Add token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("echona_token");
    console.log("[Axios Interceptor] Request:", config.method?.toUpperCase(), config.url);
    console.log("[Axios Interceptor] Token:", token ? "Found" : "Not found");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("[Axios Interceptor] Request error:", error);
    return Promise.reject(error);
  }
);

// Add response error logging and handle 401
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("[Axios Interceptor] Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("[Axios Interceptor] Response error:");
    console.error("  - Message:", error.message);
    console.error("  - Status:", error.response?.status);
    console.error("  - Data:", error.response?.data);
    console.error("  - URL:", error.config?.url);
    
    // Network error (backend not reachable)
    if (!error.response) {
      console.error("[Axios Interceptor] Network error - backend not reachable");
      error.message = "Cannot connect to server. Please check if the backend is running on http://localhost:5000";
      return Promise.reject(error);
    }
    
    // If 401 Unauthorized, token is invalid or expired
    if (error.response?.status === 401) {
      console.error("[Axios Interceptor] 401 Unauthorized - Token invalid/expired");
      
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Invalid token";
      if (errorMsg.includes("token") || errorMsg.includes("Token")) {
        setTimeout(() => {
          localStorage.removeItem("echona_token");
          localStorage.removeItem("echona_user");
          if (window.location.pathname !== "/auth") {
            window.location.href = "/auth";
          }
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
