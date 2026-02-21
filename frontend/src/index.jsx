import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { MoodProvider } from "./context/MoodContext";
import SessionWarning from "./components/SessionWarning";
import OnboardingTour from "./components/OnboardingTour";
import "./index.css";

// Force dark mode — remove any stale light-mode preferences
localStorage.removeItem("echona_theme");
document.documentElement.classList.remove("light-mode");
document.documentElement.classList.add("dark");

window.addEventListener("unhandledrejection", (event) => {
  console.error("[Unhandled Promise Rejection]", event.reason);
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <HelmetProvider>
    <AppErrorBoundary>
      <AuthProvider>
        <MoodProvider>
          <BrowserRouter>
            <SessionWarning />
            <OnboardingTour />
            <App />
          </BrowserRouter>
        </MoodProvider>
      </AuthProvider>
    </AppErrorBoundary>
  </HelmetProvider>
);
