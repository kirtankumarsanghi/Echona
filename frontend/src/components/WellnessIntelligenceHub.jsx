import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import axiosInstance from "../api/axiosInstance";

const HABIT_KEYS = [
  { key: "sleep", label: "7h+ Sleep" },
  { key: "hydration", label: "Hydration" },
  { key: "exercise", label: "Exercise" },
  { key: "social", label: "Social Time" },
  { key: "screenLimit", label: "Low Screen" },
];

function getDateKey(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

function buildInterventionPlan({ mood, score, trendLabel }) {
  const lowerMood = String(mood || "").toLowerCase();

  if (["anxious", "stressed", "angry"].includes(lowerMood) || score <= 4) {
    return {
      title: "Regulate and Reset",
      level: "High Support",
      steps: [
        "2-minute paced breathing to lower body tension",
        "Write one pressure point and one action you can control",
        "Play a calming transition playlist before your next task",
      ],
      cta: [
        { label: "Start Breathing", path: "/mood-detect" },
        { label: "Open Music", path: "/music" },
      ],
    };
  }

  if (["sad", "lonely", "tired"].includes(lowerMood) || trendLabel === "Needs care") {
    return {
      title: "Recover and Rebuild",
      level: "Moderate Support",
      steps: [
        "Do a gentle activation task for 10 minutes",
        "Send one message to someone you trust",
        "Log one small win before the day ends",
      ],
      cta: [
        { label: "View Planner", path: "/todo" },
        { label: "Detect Again", path: "/mood-detect" },
      ],
    };
  }

  if (["happy", "excited"].includes(lowerMood) && score >= 8) {
    return {
      title: "Build Momentum",
      level: "Growth Mode",
      steps: [
        "Schedule one focused task while energy is high",
        "Capture why today felt good",
        "Save an uplifting playlist for your next low-energy day",
      ],
      cta: [
        { label: "Plan Tasks", path: "/todo" },
        { label: "Save Music", path: "/music" },
      ],
    };
  }

  return {
    title: "Stay Balanced",
    level: "Steady Mode",
    steps: [
      "Take a short posture and breathing reset",
      "Prioritize your top 1 task for the next 90 minutes",
      "Finish with a short reflection check-in",
    ],
    cta: [
      { label: "Go to Planner", path: "/todo" },
      { label: "Mood Check", path: "/mood-detect" },
    ],
  };
}

function buildCopilotReply(message, mood, trendLabel) {
  const text = message.toLowerCase();

  if (/(overwhelm|overwhelmed|stress|deadline|pressure|panic|anx)/.test(text)) {
    return "I hear that pressure. Let us reduce load now: 1) Pick one must-do task only, 2) Do 2 minutes of box breathing, 3) Start a calm playlist and work in one 25-minute block.";
  }

  if (/(sad|down|low|empty|lonely|hopeless)/.test(text)) {
    return "Thanks for sharing that. Try a gentle recovery loop: 1) Move your body for 5-10 minutes, 2) Write one sentence about what hurts most, 3) Message one trusted person.";
  }

  if (/(tired|drain|exhaust|sleepy|fatigue)/.test(text)) {
    return "Your system may need restoration. Try this: hydrate now, do a 10-minute low-effort task, and schedule a sleep-protecting wind-down tonight.";
  }

  if (/(happy|great|good|better|excited|motivated)/.test(text)) {
    return "Great energy. Let us lock it in: choose one high-value task, capture what is working today, and save this routine for days when mood drops.";
  }

  return `Based on your current state (${mood}, trend: ${trendLabel}), I suggest a simple 3-step check-in: name the feeling, choose one tiny action, and schedule a 15-minute follow-up review.`;
}

function WellnessIntelligenceHub({ history, todayMood, todayScore, trendLabel, streak, onNavigate }) {
  const [habitStore, setHabitStore] = useState({});
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "How are you feeling now? I can guide a quick reflection and suggest concrete next actions.",
    },
  ]);
  const [forecast, setForecast] = useState({ baseline: 0, riskWindows: [], timeline: [] });
  const [bootstrapped, setBootstrapped] = useState(false);
  const [loadingState, setLoadingState] = useState(true);
  const [syncError, setSyncError] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [refreshingCloud, setRefreshingCloud] = useState(false);

  const todayKey = getDateKey();
  const todayHabits = habitStore[todayKey] || {};

  useEffect(() => {
    let active = true;

    const loadWellnessState = async () => {
      try {
        setSyncError("");
        const { data } = await axiosInstance.get("/api/wellness/state");
        if (!active || !data?.success) return;

        setHabitStore(data.state?.habitsByDate || {});
        setForecast(data.forecast || { baseline: 0, riskWindows: [], timeline: [] });

        const persistedConversation = data.state?.copilotConversation || [];
        if (persistedConversation.length) {
          setChatMessages(persistedConversation.map((entry) => ({ role: entry.role, text: entry.text })));
        }
      } catch (err) {
        if (active) setSyncError("Could not load cloud wellness data. Showing latest available view.");
        console.error("Failed to load wellness state", err);
      } finally {
        if (active) {
          setBootstrapped(true);
          setLoadingState(false);
        }
      }
    };

    loadWellnessState();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!bootstrapped || !history.length) return;

    const syncMoodHistory = async () => {
      try {
        const { data } = await axiosInstance.post("/api/wellness/mood-sync", { history });
        if (data?.success && data?.forecast) {
          setForecast(data.forecast);
        }
      } catch (err) {
        setSyncError("Could not sync mood timeline for forecast. Try again shortly.");
        console.error("Failed to sync mood history", err);
      }
    };

    syncMoodHistory();
  }, [bootstrapped, history]);

  const handleRetrySync = async () => {
    try {
      setRefreshingCloud(true);
      setSyncError("");

      const { data } = await axiosInstance.get("/api/wellness/state");
      if (data?.success) {
        setHabitStore(data.state?.habitsByDate || {});
        setForecast(data.forecast || { baseline: 0, riskWindows: [], timeline: [] });

        const persistedConversation = data.state?.copilotConversation || [];
        if (persistedConversation.length) {
          setChatMessages(persistedConversation.map((entry) => ({ role: entry.role, text: entry.text })));
        }
      }

      if (history.length) {
        const syncRes = await axiosInstance.post("/api/wellness/mood-sync", { history });
        if (syncRes.data?.success && syncRes.data?.forecast) {
          setForecast(syncRes.data.forecast);
        }
      }
    } catch (err) {
      setSyncError("Retry failed. Please check your connection and try again.");
      console.error("Failed to retry cloud sync", err);
    } finally {
      setRefreshingCloud(false);
    }
  };

  const intervention = useMemo(
    () => buildInterventionPlan({ mood: todayMood, score: todayScore, trendLabel }),
    [todayMood, todayScore, trendLabel]
  );

  const weeklyReport = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const weekEntries = history.filter((entry) => new Date(entry.createdAt) >= weekAgo);

    if (!weekEntries.length) {
      return {
        avg: 0,
        total: 0,
        dominantMood: "No data",
        bestDay: "-",
        toughDay: "-",
        summary: "Add more mood check-ins to unlock your weekly report.",
      };
    }

    const average = weekEntries.reduce((sum, entry) => sum + entry.score, 0) / weekEntries.length;

    const moodCounts = {};
    weekEntries.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0];

    const dayBucket = {};
    weekEntries.forEach((entry) => {
      const day = new Date(entry.createdAt).toLocaleDateString("en-US", { weekday: "short" });
      dayBucket[day] = dayBucket[day] || [];
      dayBucket[day].push(entry.score);
    });

    const dayAverages = Object.entries(dayBucket).map(([day, scores]) => ({
      day,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));

    dayAverages.sort((a, b) => b.avg - a.avg);

    return {
      avg: average,
      total: weekEntries.length,
      dominantMood,
      bestDay: dayAverages[0]?.day || "-",
      toughDay: dayAverages[dayAverages.length - 1]?.day || "-",
      summary:
        trendLabel === "Improving"
          ? "Your emotional baseline is improving. Keep your current recovery habits consistent."
          : trendLabel === "Needs care"
            ? "This week showed more strain. Prioritize recovery blocks and lower cognitive overload."
            : "Your mood is stable this week. Small habit upgrades can move it upward.",
    };
  }, [history, trendLabel]);

  const habitCorrelation = useMemo(() => {
    const moodByDay = {};
    const scoresByDay = {};

    history.forEach((entry) => {
      const day = getDateKey(entry.createdAt);
      scoresByDay[day] = scoresByDay[day] || [];
      scoresByDay[day].push(entry.score);
    });

    Object.keys(scoresByDay).forEach((day) => {
      const scores = scoresByDay[day];
      moodByDay[day] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    return HABIT_KEYS.map(({ key, label }) => {
      const trueScores = [];
      const falseScores = [];

      Object.keys(habitStore).forEach((day) => {
        if (typeof moodByDay[day] !== "number") return;
        if (habitStore[day]?.[key]) trueScores.push(moodByDay[day]);
        else falseScores.push(moodByDay[day]);
      });

      if (trueScores.length < 2 || falseScores.length < 2) {
        return { key, label, impact: null };
      }

      const trueAvg = trueScores.reduce((a, b) => a + b, 0) / trueScores.length;
      const falseAvg = falseScores.reduce((a, b) => a + b, 0) / falseScores.length;
      return { key, label, impact: trueAvg - falseAvg };
    });
  }, [habitStore, history]);

  const toggleHabit = async (habitKey) => {
    const updated = {
      ...habitStore,
      [todayKey]: {
        ...todayHabits,
        [habitKey]: !todayHabits[habitKey],
      },
    };

    setHabitStore(updated);

    try {
      setSyncError("");
      await axiosInstance.post("/api/wellness/habits", {
        date: todayKey,
        habits: updated[todayKey],
      });
    } catch (err) {
      setSyncError("Failed to save habit update. Please retry.");
      console.error("Failed to persist habits", err);
    }
  };

  const sendMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const assistantMessage = buildCopilotReply(trimmed, todayMood, trendLabel);
    const next = [
      ...chatMessages,
      { role: "user", text: trimmed },
      { role: "assistant", text: assistantMessage },
    ];

    setChatMessages(next);
    setChatInput("");

    try {
      setSendingChat(true);
      setSyncError("");
      await axiosInstance.post("/api/wellness/copilot", { role: "user", text: trimmed });
      await axiosInstance.post("/api/wellness/copilot", { role: "assistant", text: assistantMessage });
    } catch (err) {
      setSyncError("Message sent locally, but cloud sync failed.");
      console.error("Failed to persist copilot chat", err);
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
      {loadingState && (
        <div className="xl:col-span-2 rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-300">
          Loading your wellness cloud data...
        </div>
      )}

      {!loadingState && syncError && (
        <div className="xl:col-span-2 rounded-xl border border-rose-500/35 bg-rose-500/10 p-3 text-sm text-rose-200 flex flex-wrap items-center justify-between gap-3">
          <span>{syncError}</span>
          <button
            type="button"
            onClick={handleRetrySync}
            disabled={refreshingCloud}
            className="px-3 py-1.5 rounded-lg border border-rose-300/40 bg-rose-500/15 hover:bg-rose-500/25 disabled:opacity-60 disabled:cursor-not-allowed text-xs font-medium"
          >
            {refreshingCloud ? "Retrying..." : "Retry Sync"}
          </button>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Smart Intervention Engine</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-200">{intervention.level}</span>
        </div>
        <p className="text-sm text-slate-300 mb-3">Recommended now: <span className="font-medium text-white">{intervention.title}</span></p>
        <ol className="space-y-2 mb-4">
          {intervention.steps.map((step, idx) => (
            <li key={step} className="text-sm text-slate-300 flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-200">{idx + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          {intervention.cta.map((item) => (
            <button key={item.label} onClick={() => onNavigate(item.path)} className="btn-secondary text-sm">
              {item.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-premium p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Weekly Wellness Report</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-200">{weeklyReport.total} logs</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs text-slate-400">Average Mood</p>
            <p className="text-xl text-white font-semibold">{weeklyReport.avg ? weeklyReport.avg.toFixed(1) : "-"}/10</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs text-slate-400">Dominant Mood</p>
            <p className="text-xl text-white font-semibold">{weeklyReport.dominantMood}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs text-slate-400">Best Day</p>
            <p className="text-xl text-emerald-300 font-semibold">{weeklyReport.bestDay}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs text-slate-400">Recovery Streak</p>
            <p className="text-xl text-amber-300 font-semibold">{streak}d</p>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{weeklyReport.summary}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card-premium p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Emotional Weather Forecast</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-200">Baseline {forecast.baseline || "-"}/10</span>
        </div>

        {forecast.riskWindows?.length ? (
          <div className="space-y-2 mb-4">
            {forecast.riskWindows.map((window) => (
              <div key={window.label} className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-rose-200">{window.label} • {window.zone}</p>
                  <p className="text-xs text-rose-100/80">{window.avgScore}/10 • {window.confidence}</p>
                </div>
                <p className="text-xs text-rose-100/85">{window.suggestion}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-300 mb-4">No major dip windows detected right now. Keep your current routine steady.</p>
        )}

        <div className="grid grid-cols-4 gap-2">
          {(forecast.timeline || []).slice(0, 8).map((slot) => (
            <div key={slot.label} className="rounded-lg border border-slate-700 bg-slate-900/60 p-2 text-center">
              <p className="text-[11px] text-slate-400">{slot.label}</p>
              <p className={`text-xs font-semibold ${slot.zone === "Dip risk" ? "text-rose-300" : slot.zone === "Uplift" ? "text-emerald-300" : "text-sky-300"}`}>
                {slot.zone}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Habit-Mood Correlation</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-200">Today</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {HABIT_KEYS.map((habit) => {
            const active = !!todayHabits[habit.key];
            return (
              <button
                key={habit.key}
                onClick={() => toggleHabit(habit.key)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  active
                    ? "bg-emerald-500/18 text-emerald-200 border-emerald-500/40"
                    : "bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-800"
                }`}
              >
                {habit.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {habitCorrelation.map((row) => (
            <div key={row.key} className="flex items-center justify-between text-sm rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2">
              <span className="text-slate-300">{row.label}</span>
              {row.impact == null ? (
                <span className="text-slate-500">Need more data</span>
              ) : row.impact >= 0 ? (
                <span className="text-emerald-300">+{row.impact.toFixed(1)} mood points</span>
              ) : (
                <span className="text-rose-300">{row.impact.toFixed(1)} mood points</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-premium p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">AI Copilot Chat</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-200">Guided Reflection</span>
        </div>

        <div className="h-52 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/60 p-3 space-y-2 mb-3">
          {chatMessages.map((msg, idx) => (
            <div
              key={`${msg.role}-${idx}`}
              className={`text-sm px-3 py-2 rounded-lg max-w-[92%] ${
                msg.role === "assistant"
                  ? "bg-slate-800 text-slate-200"
                  : "bg-primary-600/25 text-primary-100 ml-auto border border-primary-500/35"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            placeholder="Tell me what you are feeling..."
          />
          <button onClick={sendMessage} className="btn-primary text-sm">
            {sendingChat ? "Sending..." : "Send"}
          </button>
        </div>
      </motion.div>
    </section>
  );
}

export default WellnessIntelligenceHub;
