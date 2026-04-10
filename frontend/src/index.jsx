import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { MoodProvider } from "./context/MoodContext";
import OnboardingTour from "./components/OnboardingTour";
import { initializeTheme } from "./utils/theme";
import "./index.css";

initializeTheme();

window.addEventListener("unhandledrejection", (event) => {
  console.error("[Unhandled Promise Rejection]", event.reason);
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
if (!GOOGLE_CLIENT_ID) {
  console.error("[Auth] Missing VITE_GOOGLE_CLIENT_ID. Google Sign-In is disabled.");
}

const appTree = (
  <HelmetProvider>
    <AppErrorBoundary>
      <AuthProvider>
        <MoodProvider>
          <BrowserRouter>
            <OnboardingTour />
            <App />
          </BrowserRouter>
        </MoodProvider>
      </AuthProvider>
    </AppErrorBoundary>
  </HelmetProvider>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  GOOGLE_CLIENT_ID
    ? <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{appTree}</GoogleOAuthProvider>
    : appTree
);
