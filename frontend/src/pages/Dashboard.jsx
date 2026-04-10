import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "../components/AppShell";
import OptionsMenu from "../components/OptionsMenu";
import EmptyState from "../components/EmptyState";
import MoodInsights from "../components/MoodInsights";
import JournalModal from "../components/JournalModal";
import SEO from "../components/SEO";
import WorkspaceStateMessage from "../components/WorkspaceStateMessage";
import { useToast } from "../components/Toast";
import { useMood } from "../context/MoodContext";
import { useAuth } from "../context/AuthContext";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import { MOTION } from "../utils/motion";

ChartJS.register(LineElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

// Icons
const Icons = {
  Music: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  Todo: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
};

// Time filter constants (#15)
const TIME_FILTERS = [
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "all", label: "All Time" },
];

function Dashboard() {
  const navigate = useNavigate();
  const { history, clearHistory, refreshHistory, historyLoaded } = useMood();
  const { user } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [showClearModal, setShowClearModal] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [timeFilter, setTimeFilter] = useState("30d");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  // Filter history by time (#15)
  const filteredHistory = (() => {
    if (timeFilter === "all" || !history.length) return history;
    const now = new Date();
    const days = timeFilter === "7d" ? 7 : 30;
    const cutoff = new Date(now - days * 24 * 60 * 60 * 1000);
    return history.filter((h) => new Date(h.createdAt) >= cutoff);
  })();

  const sortedHistory = [...history].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const getCurrentStreak = (entries) => {
    if (!entries.length) return 0;

    const uniqueDays = [...new Set(entries.map((entry) => new Date(entry.createdAt).toDateString()))]
      .map((day) => new Date(day).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a);

    let streak = 1;
    for (let i = 1; i < uniqueDays.length; i += 1) {
      const dayDiff = (uniqueDays[i - 1] - uniqueDays[i]) / (1000 * 60 * 60 * 24);
      if (dayDiff === 1) streak += 1;
      else break;
    }
    return streak;
  };

  const handleClearData = () => {
    clearHistory();
    setShowClearModal(false);
    showToast("All mood data cleared! Dashboard reset.", "success");
  };

  if (!historyLoaded) {
    return (
      <AppShell>
        <div className="app-typography-refresh">
          <SEO title="Dashboard" description="Track your emotional wellness journey with ECHONA" path="/dashboard" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <WorkspaceStateMessage
              title="Loading dashboard insights"
              description="Fetching your latest check-ins, trends, and performance signals from live storage."
              variant="info"
            />
          </div>
        </div>
      </AppShell>
    );
  }

  // Empty state (#17)
  if (!history.length) {
    return (
      <AppShell>
        <div className="app-typography-refresh">
          <SEO title="Dashboard" description="Track your emotional wellness journey with ECHONA" path="/dashboard" />
          <EmptyState
            icon={
              <svg className="w-14 h-14 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="No Mood Data Yet"
            description="Start tracking your emotional wellness journey. Detect your first mood to see trends, insights, and personalized recommendations."
            actionLabel="Start Check-In"
            actionPath="/mood-detect"
            secondaryLabel="Open Music"
            secondaryPath="/music"
          />
        </div>
      </AppShell>
    );
  }

  const data = filteredHistory.length ? filteredHistory : history;
  const today = data[data.length - 1];
  const todayMood = today.mood;
  const todayScore = today.score;
  const avgScore = (data.reduce((sum, item) => sum + item.score, 0) / data.length).toFixed(1);
  const best = data.reduce((a, b) => (a.score > b.score ? a : b));
  const streak = getCurrentStreak(sortedHistory);

  // Chart data
  const lineData = {
    labels: data.map((h) => new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })),
    datasets: [{
      label: "Mood Score",
      data: data.map((h) => h.score),
      borderColor: "rgb(20, 184, 166)",
      backgroundColor: "rgba(20, 184, 166, 0.12)",
      tension: 0.4, pointRadius: 4, pointHoverRadius: 6,
      pointBackgroundColor: "rgb(20, 184, 166)",
      pointBorderColor: "rgb(248, 250, 252)", pointBorderWidth: 2,
      borderWidth: 3, fill: true,
    }],
  };

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: "rgba(15,23,42,0.92)", padding: 12, titleFont: { size: 14, weight: "bold" }, bodyFont: { size: 13 }, borderColor: "rgba(20,184,166,0.35)", borderWidth: 1, callbacks: { title: (items) => { const idx = items[0]?.dataIndex; if (idx == null) return ''; const d = new Date(data[idx].createdAt); return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + "  " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } } } },
    scales: {
      y: { grid: { color: "rgba(148,163,184,0.18)", drawBorder: false }, ticks: { color: "#cbd5e1", font: { size: 12 } }, max: 10, beginAtZero: true },
      x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 11 } } },
    },
  };

  const moodCounts = {};
  data.forEach((h) => (moodCounts[h.mood] = (moodCounts[h.mood] || 0) + 1));

  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || todayMood;
  const recentSample = sortedHistory.slice(-5);
  const previousSample = sortedHistory.slice(-10, -5);
  const recentAverage = recentSample.length
    ? recentSample.reduce((sum, item) => sum + item.score, 0) / recentSample.length
    : todayScore;
  const previousAverage = previousSample.length
    ? previousSample.reduce((sum, item) => sum + item.score, 0) / previousSample.length
    : recentAverage;
  const trendDelta = recentAverage - previousAverage;
  const trendLabel = trendDelta > 0.1 ? "Improving" : trendDelta < -0.1 ? "Needs care" : "Steady";
  const trendColor = trendDelta > 0.1 ? "text-emerald-400" : trendDelta < -0.1 ? "text-rose-400" : "text-sky-400";

  const nextAction =
    trendLabel === "Needs care"
      ? {
          title: "Today needs a gentle reset",
          description: "Take a quick check-in, then write one short note to regain emotional clarity.",
          cta: "Start 2-Min Check-In",
          onClick: () => navigate("/mood-detect"),
        }
      : trendLabel === "Improving"
        ? {
            title: "Your momentum is building",
            description: "Capture what is working with a quick reflection and one intentional task.",
            cta: "Write Reflection",
            onClick: () => setJournalOpen(true),
          }
        : {
            title: "You are in a stable rhythm",
            description: "Protect consistency with one check-in and one meaningful action today.",
            cta: "Plan Next Step",
            onClick: () => navigate("/todo"),
          };

  const doughnutData = {
    labels: Object.keys(moodCounts),
    datasets: [{
      data: Object.values(moodCounts),
      backgroundColor: ["#1d4ed8", "#0284c7", "#dc2626", "#059669", "#7c3aed", "#475569"],
      borderColor: "#0f172a", borderWidth: 2, hoverOffset: 6,
    }],
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#cbd5e1", font: { size: 12, weight: "600" }, padding: 16 }, position: "bottom" }, tooltip: { backgroundColor: "rgba(15,23,42,0.92)", padding: 12 } },
    cutout: "65%",
  };

  const getMoodBadgeColor = (mood) => {
    const colors = { Happy: "badge-warning", Sad: "badge-error", Angry: "badge-error", Calm: "badge-success", Excited: "badge-primary", Anxious: "badge-error" };
    return colors[mood] || "badge-primary";
  };

    return (
      <AppShell>
      <SEO title="Dashboard" description="Track your emotional wellness journey with ECHONA" path="/dashboard" />

      <div className="app-typography-refresh relative z-10 pt-12 lg:pt-4 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="pointer-events-none absolute inset-x-0 -top-8 -z-10 flex justify-center">
          <div className="h-44 w-[92%] rounded-full bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-emerald-500/15 blur-3xl" />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION.duration.section, ease: MOTION.ease }}
          className="workspace-header-surface mb-5 sm:mb-6 backdrop-blur-sm p-4 sm:p-5 md:p-6"
        >
          <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="workspace-kicker">Emotional Analytics</p>
              <h1 className="workspace-title text-[clamp(1.9rem,3.5vw,2.5rem)]">Your Wellness Snapshot{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</h1>
              <p className="workspace-subtitle text-sm sm:text-[15px] md:text-base max-w-xl">
                Track your emotional patterns, review progress, and choose the right next action.
              </p>
            </div>

            <div className="ml-auto flex items-start sm:items-end gap-2 sm:gap-3 pl-2">
              <div className="text-right hidden sm:block flex-shrink-0 min-w-fit">
                <p className="text-2xl font-mono font-light text-slate-100 tracking-wider">
                  {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentTime.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: MOTION.duration.base, ease: MOTION.ease }}
                className="shrink-0"
              >
                <OptionsMenu currentPage="/dashboard" />
              </motion.div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/mood-detect")}
              className="btn-primary text-sm"
              aria-label="Start Check-In"
              title="Start Check-In"
            >
              New Check-In
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setJournalOpen(true)}
              className="btn-secondary text-sm"
              aria-label="Open Journal"
              title="Open Journal"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Journal
            </motion.button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowActionMenu((prev) => !prev)}
                className="btn-secondary text-sm"
                aria-label="More actions"
                aria-expanded={showActionMenu}
              >
                More
              </button>
              <AnimatePresence>
                {showActionMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 min-w-[180px] z-20 workspace-surface-soft p-1.5 shadow-lg"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionMenu(false);
                        setShowClearModal(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-500/10"
                    >
                      Reset Data
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: MOTION.duration.base, ease: MOTION.ease }}
          className="workspace-surface mb-6 p-5"
          aria-label="Guided action strip"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="workspace-kicker mb-1">Today's Focus</p>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-100">{nextAction.title}</h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">{nextAction.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={nextAction.onClick} className="btn-primary text-sm">{nextAction.cta}</button>
              <button onClick={() => setJournalOpen(true)} className="btn-secondary text-sm">Journal</button>
              <button onClick={() => navigate("/todo")} className="btn-secondary text-sm">Planner</button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              "Check streak and trend before decisions.",
              "Look for shifts in your mood distribution.",
              "Take one small action before closing.",
            ].map((step, idx) => (
              <div key={step} className="flex items-start gap-2.5 sm:border-l sm:border-slate-800/45 sm:pl-3 first:sm:border-l-0 first:sm:pl-0">
                <span className="mt-0.5 inline-flex w-5 h-5 rounded-full border border-slate-600/70 bg-slate-800/70 text-[11px] text-slate-200 items-center justify-center">{idx + 1}</span>
                <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Mood Insights (#6) */}
        <MoodInsights />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: MOTION.stagger.fast * 2, duration: MOTION.duration.base, ease: MOTION.ease }}
          className="workspace-surface-soft mt-6 mb-5 p-4 sm:p-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0">
            <div className="md:pr-4 md:border-r md:border-slate-800/45">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Streak</p>
              <div className="flex items-end justify-between gap-3">
                <p className="text-2xl font-semibold text-white">{streak} day{streak > 1 ? "s" : ""}</p>
                <span className="text-xs text-amber-300">Consistency</span>
              </div>
            </div>
            <div className="md:px-4 md:border-r md:border-slate-800/45">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Trend</p>
              <div className="flex items-end justify-between gap-3">
                <p className={`text-2xl font-semibold ${trendColor}`}>{trendLabel}</p>
                <span className="text-xs text-slate-300">{trendDelta >= 0 ? "+" : ""}{trendDelta.toFixed(1)} pts</span>
              </div>
            </div>
            <div className="md:pl-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Top Mood</p>
              <div className="flex items-end justify-between gap-3">
                <p className="text-2xl font-semibold text-white">{dominantMood}</p>
                <span className="text-xs text-sky-300">Most frequent</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="workspace-surface mb-5 p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="Today's Mood" value={todayMood} subtitle={`${todayScore}/10`}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              gradient="from-primary-600 to-primary-500" delay={0} />
            <StatCard title="Average Score" value={avgScore} subtitle="Overall rating"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
              gradient="from-secondary-600 to-secondary-500" delay={0.1} />
            <StatCard title="Best Day" value={best.score} subtitle={best.mood}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
              gradient="from-accent-600 to-accent-500" delay={0.2} />
            <StatCard title="Total Entries" value={data.length} subtitle="Tracked moods"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              gradient="from-purple-600 to-pink-600" delay={0.3} />
          </div>
        </div>

        {/* Time Filter (#15) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="flex items-center gap-2 mb-5" role="tablist" aria-label="Time range filter">
          {TIME_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTimeFilter(f.key)}
              role="tab"
              aria-selected={timeFilter === f.key}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                timeFilter === f.key
                  ? "bg-indigo-600/14 text-indigo-300 border border-indigo-500/25"
                  : "bg-transparent text-neutral-400 border border-neutral-800/45 hover:bg-neutral-900/30 hover:text-neutral-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }} className="workspace-surface p-5 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg border border-slate-700/60 bg-slate-800/70 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <div><h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">Mood Trend ({timeFilter === "7d" ? "Last 7 Days" : timeFilter === "30d" ? "Last 30 Days" : "All Time"})</h3><p className="text-[11px] text-[var(--text-secondary)]">Your score pattern across recent check-ins</p></div>
            </div>
            <div className="h-[300px]" role="img" aria-label="Mood trend line chart"><Line data={lineData} options={lineOptions} /></div>
            <p className="mt-3 text-xs text-[var(--text-secondary)]">{trendLabel === "Improving" ? "Recent check-ins show upward momentum compared with the previous sample." : trendLabel === "Needs care" ? "Recent check-ins dipped versus the previous sample. A quick check-in can help rebalance." : "Your trend is stable this week. Keep consistency with one small action today."}</p>
          </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:border-l lg:border-slate-800/45 lg:pl-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg border border-slate-700/60 bg-slate-800/70 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/></svg>
              </div>
              <div><h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">Mood Distribution</h3><p className="text-[11px] text-[var(--text-secondary)]">How often each mood appears in this range</p></div>
            </div>
            <div className="h-[300px] flex items-center justify-center" role="img" aria-label="Mood distribution doughnut chart">
              <div className="w-full max-w-[250px]"><Doughnut data={doughnutData} options={doughnutOptions} /></div>
            </div>
            <p className="mt-3 text-xs text-[var(--text-secondary)]">Most frequent mood: <span className="font-semibold text-[var(--text-primary)]">{dominantMood}</span></p>
            </motion.div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="workspace-surface p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg border border-slate-700/60 bg-slate-800/70 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div><h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">Recent Check-Ins</h3><p className="text-[11px] text-[var(--text-secondary)]">Your latest entries and score intensity</p></div>
            </div>
            <button onClick={() => navigate("/mood-detect")} className="btn-primary text-sm" aria-label="Start Check-In">Add Check-In</button>
          </div>

          <div className="divide-y divide-slate-800/45">
            {data.slice().reverse().slice(0, 6).map((entry, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.05 }}
                className="py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-neutral-100">{entry.mood}</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">{new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <span className={`badge ${getMoodBadgeColor(entry.mood)}`}>{entry.score}/10</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(entry.score / 10) * 100}%` }} transition={{ delay: 0.8 + idx * 0.05, duration: 0.6 }} className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 workspace-surface-soft p-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-sm text-slate-400 mr-1">Quick links:</span>
            <button onClick={() => navigate("/music")} className="btn-secondary text-sm" aria-label="Open Music page"><Icons.Music />Music</button>
            <button onClick={() => navigate("/todo")} className="btn-secondary text-sm" aria-label="Go to Planner page"><Icons.Todo />Planner</button>
          </div>
        </motion.div>
      </div>

      {/* Journal Modal (#11) */}
      <JournalModal isOpen={journalOpen} onClose={() => setJournalOpen(false)} mood={todayMood} />

      {/* Clear Data Modal (#4 � uses toast, not alert) */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowClearModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="clear-title">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 id="clear-title" className="text-2xl font-bold text-white mb-2">Clear All Data?</h3>
                <p className="text-gray-400">This will permanently delete all your mood history ({history.length} entries) and reset your dashboard.</p>
              </div>
              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowClearModal(false)} className="flex-1 px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors">Cancel</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleClearData} className="flex-1 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors">Clear Data</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer />
    </AppShell>
  );
}

function StatCard({ title, value, subtitle, icon, gradient, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="workspace-surface-soft p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center opacity-85`}>{icon}</div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)] mb-1">{title}</p>
        <p className="text-2xl sm:text-[1.7rem] font-semibold leading-tight text-[var(--text-primary)] mb-1">{value}</p>
        <p className="text-[11px] text-[var(--text-secondary)]">{subtitle}</p>
      </div>
    </motion.div>
  );
}

export default Dashboard;
