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
import "./index.css";

// Force dark mode
localStorage.removeItem("echona_theme");
document.documentElement.classList.remove("light-mode");
document.documentElement.classList.add("dark");

window.addEventListener("unhandledrejection", (event) => {
  console.error("[Unhandled Promise Rejection]", event.reason);
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
  </GoogleOAuthProvider>
);
