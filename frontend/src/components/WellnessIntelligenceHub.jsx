import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import axiosInstance from "../api/axiosInstance";

const HABIT_KEYS = [
  { key: "sleep", label: "7h+ Sleep" },
  { key: "hydration", label: "Hydration" },
  { key: "exercise", label: "Exercise" },
  { key: "social", label: "Social Time" },
  { key: "screenLimit", label: "Low Screen" },
];

const COPILOT_TONES = [
  { key: "calm", label: "Calm" },
  { key: "coach", label: "Coach" },
  { key: "direct", label: "Direct" },
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

function extractPrimaryState(text) {
  if (/(overwhelm|overwhelmed|stress|deadline|pressure|panic|anxious|anxiety)/.test(text)) return "stressed";
  if (/(sad|down|low|empty|lonely|hopeless|crying)/.test(text)) return "sad";
  if (/(angry|frustrat|irritat|mad|rage)/.test(text)) return "angry";
  if (/(tired|drain|exhaust|sleepy|fatigue|burnout|burned out)/.test(text)) return "tired";
  if (/(happy|great|good|better|excited|motivated|confident|grateful)/.test(text)) return "positive";
  if (/(horny|lust|sexual urge|turned on)/.test(text)) return "distracted";
  return "unclear";
}

function extractNeed(text) {
  if (/(study|exam|focus|concentrat|work|office|project|deadline)/.test(text)) return "focus";
  if (/(sleep|night|insomnia|rest)/.test(text)) return "sleep";
  if (/(friend|family|partner|relationship|alone|lonely)/.test(text)) return "connection";
  if (/(panic|anxiety|calm|breath|breathe)/.test(text)) return "calm";
  return "general";
}

function buildCopilotReply(message, mood, trendLabel, conversation = []) {
  const raw = String(message || "").trim();
  const compact = raw.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

  if (!compact) {
    return "Share one clear sentence about what is happening, and I will give you a practical next step.";
  }

  if (/(suicid|kill myself|self harm|hurt myself|end my life)/.test(compact)) {
    return "I am really glad you shared this. You deserve immediate support right now. If you may act on these thoughts, call your local emergency number now and contact someone you trust to stay with you while you get help.";
  }

  if (/^(hi|hello|hey)\b/.test(compact)) {
    return "I am here with you. Tell me in one line how your mind and body feel right now, and I will help you make a sensible plan for the next 15 minutes.";
  }

  if (/(how are you|who are you|what can you do)/.test(compact)) {
    return "I am here and ready to support you. I can help you break down what you are feeling, choose one realistic next action, and follow up until you feel more steady.";
  }

  if (/(thank you|thanks)/.test(compact)) {
    return "You are welcome. If you want, we can do a quick follow-up check now: what is your stress level from 1 to 10?";
  }

  const state = extractPrimaryState(compact);
  const need = extractNeed(compact);
  const recentUserMessages = conversation
    .filter((item) => item.role === "user")
    .slice(-3)
    .map((item) => String(item.text || "").trim())
    .filter(Boolean);

  if (/(not calm|not okay|not fine|not good|you are wrong)/.test(compact)) {
    return "Thank you for correcting me. I understand you are not calm right now. Tell me the strongest feeling in one word, and I will tailor the next step exactly to that feeling.";
  }

  if (state === "distracted") {
    return "Thanks for being direct. It sounds like your mind is pulled by strong desire. If you want control and focus now: 1) cold water on face and 10 slow breaths, 2) 5-minute brisk movement, 3) one small task for 15 minutes with no notifications.";
  }

  if (state === "stressed") {
    return need === "focus"
      ? "You sound overloaded and under pressure. Try this work reset now: 1) write only one must-do task, 2) do 2 minutes of box breathing, 3) run one 25-minute focus sprint. After that, message me what changed."
      : "You sound stressed. Let us reduce load first: 1) breathe slowly for 2 minutes, 2) pick one thing you can control in the next hour, 3) postpone one non-urgent task.";
  }

  if (state === "sad") {
    return need === "connection"
      ? "I hear the heaviness and disconnection. Try this gentle plan: 1) drink water and step outside for 5 minutes, 2) send one short message to someone safe, 3) do one tiny self-care action before sleep."
      : "That sounds emotionally heavy. For the next 20 minutes: 1) move your body gently, 2) write one honest sentence about what hurts, 3) choose one low-pressure task to regain momentum.";
  }

  if (state === "angry") {
    return "I hear strong frustration. Use this de-escalation sequence: 1) pause for 90 seconds, 2) relax jaw and shoulders, 3) write one clear boundary or request before responding to anyone.";
  }

  if (state === "tired") {
    return need === "sleep"
      ? "Your body sounds depleted. Tonight, protect recovery: 1) no heavy screens for 30 minutes before bed, 2) low-light wind-down, 3) set one realistic wake time and keep it tomorrow."
      : "You sound drained. Let us stabilize energy: hydrate, do one low-effort 10-minute task, then take a short reset break before continuing.";
  }

  if (state === "positive") {
    return "Love that you are feeling better. Convert this into progress: choose one high-value task now, finish it in one focused block, then note what helped your mood so you can repeat it.";
  }

  if (compact.length < 10) {
    return "I want to understand properly. Please share a bit more: what happened, how you feel, and what you need most right now.";
  }

  const reference = recentUserMessages.length > 1 ? ` I noticed this has come up across your recent messages too.` : "";
  return `I hear you.${reference} From what you wrote, the next best step is a short check-in: name the feeling, pick one 5-minute action, and review after 15 minutes. Current context says mood ${mood} with trend ${trendLabel}, so we can keep the plan simple and realistic.`;
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
  const [copilotTone, setCopilotTone] = useState("calm");
  const chatScrollRef = useRef(null);

  const todayKey = getDateKey();
  const todayHabits = habitStore[todayKey] || {};

  useEffect(() => {
    if (!chatScrollRef.current) return;
    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages, sendingChat]);

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
          const restored = persistedConversation.map((entry) => ({ role: entry.role, text: entry.text }));
          setChatMessages((current) => {
            // Do not clobber messages typed before cloud hydration completes.
            if (current.length > 1) return current;
            return restored;
          });
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
          const restored = persistedConversation.map((entry) => ({ role: entry.role, text: entry.text }));
          setChatMessages((current) => {
            if (current.length > 1) return current;
            return restored;
          });
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
    if (sendingChat) return;
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const nextConversation = [...chatMessages, { role: "user", text: trimmed }];
    setChatMessages(nextConversation);
    setChatInput("");

    try {
      setSendingChat(true);
      setSyncError("");

      await axiosInstance.post("/api/wellness/copilot", { role: "user", text: trimmed });

      const { data } = await axiosInstance.post("/api/wellness/copilot/reply", {
        message: trimmed,
        mood: todayMood || "Neutral",
        trendLabel: trendLabel || "Steady",
        tone: copilotTone,
        conversation: nextConversation,
      });

      const assistantMessage = data?.success
        ? String(data.reply || "").trim()
        : "I could not generate a reply right now. Please try again.";

      const fallbackMessage = buildCopilotReply(trimmed, todayMood, trendLabel, chatMessages);
      const finalReply = assistantMessage || fallbackMessage;

      setChatMessages((prev) => [...prev, { role: "assistant", text: finalReply }]);
      await axiosInstance.post("/api/wellness/copilot", { role: "assistant", text: finalReply });
    } catch (err) {
      const fallbackMessage = buildCopilotReply(trimmed, todayMood, trendLabel, chatMessages);
      setChatMessages((prev) => [...prev, { role: "assistant", text: fallbackMessage }]);
      setSyncError("Live reply failed. Switched to local copilot response.");
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

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-premium p-5 xl:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">AI Copilot Chat</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-200">Guided Reflection</span>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {COPILOT_TONES.map((tone) => (
            <button
              key={tone.key}
              type="button"
              onClick={() => setCopilotTone(tone.key)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                copilotTone === tone.key
                  ? "bg-violet-500/20 text-violet-100 border-violet-400/40"
                  : "bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
            >
              {tone.label}
            </button>
          ))}
        </div>

        <div ref={chatScrollRef} className="h-72 md:h-80 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/60 p-3 space-y-2 mb-3">
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

          {sendingChat && (
            <div className="text-sm px-3 py-2 rounded-lg max-w-[92%] bg-slate-800 text-slate-300 border border-slate-700">
              Thinking...
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            placeholder="Tell me what you are feeling..."
          />
          <button onClick={sendMessage} disabled={sendingChat || !chatInput.trim()} className="btn-primary text-sm min-w-[104px] disabled:opacity-60 disabled:cursor-not-allowed">
            {sendingChat ? "Sending..." : "Send"}
          </button>
        </div>
      </motion.div>
    </section>
  );
}

export default WellnessIntelligenceHub;
