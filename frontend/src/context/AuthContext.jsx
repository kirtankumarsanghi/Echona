import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUser, saveUser, clearUser } from "../utils/auth";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const [authenticated, setAuthenticated] = useState(() => Boolean(getUser()));
  const [loading, setLoading] = useState(true); // verifying session on mount

  // On mount, verify session with the server
  useEffect(() => {
    axiosInstance
      .get("/api/auth/me")
      .then(({ data }) => {
        if (data.success && data.authenticated && data.user) {
          saveUser(data.user);
          setUser(data.user);
          setAuthenticated(true);
        } else {
          clearUser();
          setUser(null);
          setAuthenticated(false);
        }
      })
      .catch(() => {
        // 401 = no active session
        clearUser();
        setUser(null);
        setAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData) => {
    saveUser(userData);
    setUser(userData);
    setAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post("/api/auth/logout");
    } catch {
      // best-effort
    }
    clearUser();
    setUser(null);
    setAuthenticated(false);
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "echona_user") {
        if (!e.newValue) {
          setUser(null);
          setAuthenticated(false);
        } else {
          try {
            const parsed = JSON.parse(e.newValue);
            setUser(parsed);
            setAuthenticated(true);
          } catch {
            /* ignore */ 
          }
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ user, authenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
