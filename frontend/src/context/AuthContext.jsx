import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getToken, getUser, login as authLogin, logout as authLogout, isLoggedIn } from "../utils/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const [authenticated, setAuthenticated] = useState(() => isLoggedIn());
  const [sessionWarning, setSessionWarning] = useState(false);
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  // Decode JWT to get expiry
  const getTokenExpiry = useCallback(() => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload.exp ? payload.exp * 1000 : null; // ms
    } catch {
      return null;
    }
  }, []);

  // Session timeout warning (#27)
  const setupSessionTimers = useCallback(() => {
    // Clear existing timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    const expiry = getTokenExpiry();
    if (!expiry) return;

    const now = Date.now();
    const timeLeft = expiry - now;
    const WARNING_BEFORE = 5 * 60 * 1000; // 5 minutes before expiry

    if (timeLeft <= 0) {
      // Already expired
      logout();
      return;
    }

    // Show warning 5 minutes before expiry
    if (timeLeft > WARNING_BEFORE) {
      warningTimerRef.current = setTimeout(() => {
        setSessionWarning(true);
      }, timeLeft - WARNING_BEFORE);
    } else {
      // Less than 5 min left, show warning immediately
      setSessionWarning(true);
    }

    // Auto-logout at expiry
    logoutTimerRef.current = setTimeout(() => {
      logout();
    }, timeLeft);
  }, [getTokenExpiry]);

  useEffect(() => {
    if (authenticated) {
      setupSessionTimers();
    }
    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [authenticated, setupSessionTimers]);

  const login = useCallback((token, userData) => {
    authLogin(token, userData);
    setUser(userData);
    setAuthenticated(true);
    setSessionWarning(false);
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    setAuthenticated(false);
    setSessionWarning(false);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
  }, []);

  const dismissSessionWarning = useCallback(() => {
    setSessionWarning(false);
  }, []);

  // Listen for storage changes (other tabs)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "echona_token") {
        if (!e.newValue) {
          setUser(null);
          setAuthenticated(false);
        } else {
          setUser(getUser());
          setAuthenticated(true);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ user, authenticated, login, logout, sessionWarning, dismissSessionWarning }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
