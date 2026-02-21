import { createContext, useContext, useState, useEffect, useCallback } from "react";

const MoodContext = createContext(null);

const MOOD_HISTORY_KEY = "echona_mood_history";
const DETECTED_MOOD_KEY = "detected_mood";

export function MoodProvider({ children }) {
  const [history, setHistory] = useState([]);
  const [currentMood, setCurrentMood] = useState(null);
  const [onboardingDone, setOnboardingDone] = useState(() => {
    return localStorage.getItem("echona_onboarding_done") === "true";
  });

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(MOOD_HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
      const mood = localStorage.getItem(DETECTED_MOOD_KEY);
      if (mood) setCurrentMood(mood);
    } catch {
      setHistory([]);
    }
  }, []);

  const saveMood = useCallback((moodName, score = null) => {
    const moodScores = { Happy: 9, Excited: 8, Calm: 7, Anxious: 4, Sad: 3, Angry: 2 };
    const entry = {
      mood: moodName,
      score: score || moodScores[moodName] || 5,
      createdAt: new Date().toISOString(),
    };
    setHistory((prev) => {
      const updated = [...prev, entry];
      localStorage.setItem(MOOD_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
    setCurrentMood(moodName);
    localStorage.setItem(DETECTED_MOOD_KEY, moodName);
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(MOOD_HISTORY_KEY);
    localStorage.removeItem(DETECTED_MOOD_KEY);
    setHistory([]);
    setCurrentMood(null);
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem("echona_onboarding_done", "true");
    setOnboardingDone(true);
  }, []);

  // Generate mood insights (#6)
  const getInsights = useCallback(() => {
    if (history.length < 3) return null;

    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const weekData = history.filter((h) => new Date(h.createdAt) >= weekAgo);

    if (weekData.length === 0) return null;

    // Most frequent mood this week
    const freq = {};
    weekData.forEach((h) => (freq[h.mood] = (freq[h.mood] || 0) + 1));
    const dominant = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];

    // Average score
    const avgScore = (weekData.reduce((s, h) => s + h.score, 0) / weekData.length).toFixed(1);

    // Trend (improving/declining/stable)
    let trend = "stable";
    if (weekData.length >= 3) {
      const firstHalf = weekData.slice(0, Math.floor(weekData.length / 2));
      const secondHalf = weekData.slice(Math.floor(weekData.length / 2));
      const firstAvg = firstHalf.reduce((s, h) => s + h.score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, h) => s + h.score, 0) / secondHalf.length;
      if (secondAvg - firstAvg > 1) trend = "improving";
      else if (firstAvg - secondAvg > 1) trend = "declining";
    }

    // Day pattern
    const dayScores = {};
    const dayCounts = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekData.forEach((h) => {
      const d = days[new Date(h.createdAt).getDay()];
      dayScores[d] = (dayScores[d] || 0) + h.score;
      dayCounts[d] = (dayCounts[d] || 0) + 1;
    });
    let bestDay = null, worstDay = null, bestAvg = 0, worstAvg = 11;
    Object.entries(dayScores).forEach(([day, total]) => {
      const avg = total / dayCounts[day];
      if (avg > bestAvg) { bestAvg = avg; bestDay = day; }
      if (avg < worstAvg) { worstAvg = avg; worstDay = day; }
    });

    // Generate message
    const trendMsg = trend === "improving" ? "Your mood has been improving!" :
                     trend === "declining" ? "Your mood has dipped recently — try some music therapy." :
                     "Your mood has been steady.";

    const message = `You've been mostly ${dominant} this week (avg ${avgScore}/10). ${trendMsg}${bestDay && worstDay && bestDay !== worstDay ? ` Best days: ${bestDay}s. Tough days: ${worstDay}s.` : ""}`;

    return { dominant, avgScore, trend, bestDay, worstDay, message, entriesThisWeek: weekData.length };
  }, [history]);

  return (
    <MoodContext.Provider value={{ history, currentMood, saveMood, clearHistory, getInsights, onboardingDone, completeOnboarding }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error("useMood must be used within MoodProvider");
  return ctx;
}
