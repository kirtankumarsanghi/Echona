import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "../components/AppShell";
import OptionsMenu from "../components/OptionsMenu";
import EmptyState from "../components/EmptyState";
import MoodInsights from "../components/MoodInsights";
import JournalModal from "../components/JournalModal";
import SEO from "../components/SEO";
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
  const { history, clearHistory } = useMood();
  const { user } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [showClearModal, setShowClearModal] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState("30d");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter history by time (#15)
  const filteredHistory = (() => {
    if (timeFilter === "all" || !history.length) return history;
    const now = new Date();
    const days = timeFilter === "7d" ? 7 : 30;
    const cutoff = new Date(now - days * 24 * 60 * 60 * 1000);
    return history.filter((h) => new Date(h.createdAt) >= cutoff);
  })();

  const handleClearData = () => {
    clearHistory();
    setShowClearModal(false);
    showToast("All mood data cleared! Dashboard reset.", "success");
  };

  // Empty state (#17)
  if (!history.length) {
    return (
      <AppShell>
        <SEO title="Dashboard" description="Track your emotional wellness journey with ECHONA" path="/dashboard" />
        <EmptyState
          icon={
            <svg className="w-14 h-14 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="No Mood Data Yet"
          description="Start tracking your emotional wellness journey. Detect your first mood to see trends, insights, and personalized recommendations."
          actionLabel="Detect Your Mood"
          actionPath="/mood-detect"
          secondaryLabel="Explore Music"
          secondaryPath="/music"
        />
      </AppShell>
    );
  }

  const data = filteredHistory.length ? filteredHistory : history;
  const today = data[data.length - 1];
  const todayMood = today.mood;
  const todayScore = today.score;
  const avgScore = (data.reduce((sum, item) => sum + item.score, 0) / data.length).toFixed(1);
  const best = data.reduce((a, b) => (a.score > b.score ? a : b));

  // Chart data
  const lineData = {
    labels: data.map((h) => new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })),
    datasets: [{
      label: "Mood Score",
      data: data.map((h) => h.score),
      borderColor: "rgb(139, 92, 246)",
      backgroundColor: "rgba(139, 92, 246, 0.1)",
      tension: 0.4, pointRadius: 4, pointHoverRadius: 6,
      pointBackgroundColor: "rgb(139, 92, 246)",
      pointBorderColor: "rgb(31, 41, 55)", pointBorderWidth: 2,
      borderWidth: 3, fill: true,
    }],
  };

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: "rgba(31,41,55,0.9)", padding: 12, titleFont: { size: 14, weight: "bold" }, bodyFont: { size: 13 }, borderColor: "rgba(139,92,246,0.3)", borderWidth: 1, callbacks: { title: (items) => { const idx = items[0]?.dataIndex; if (idx == null) return ''; const d = new Date(data[idx].createdAt); return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + "  " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } } } },
    scales: {
      y: { grid: { color: "rgba(115,115,115,0.1)", drawBorder: false }, ticks: { color: "#a3a3a3", font: { size: 12 } }, max: 10, beginAtZero: true },
      x: { grid: { display: false }, ticks: { color: "#a3a3a3", font: { size: 11 } } },
    },
  };

  const moodCounts = {};
  data.forEach((h) => (moodCounts[h.mood] = (moodCounts[h.mood] || 0) + 1));

  const doughnutData = {
    labels: Object.keys(moodCounts),
    datasets: [{
      data: Object.values(moodCounts),
      backgroundColor: ["rgb(251,191,36)", "rgb(56,189,248)", "rgb(248,113,113)", "rgb(52,211,153)", "rgb(244,114,182)", "rgb(167,139,250)"],
      borderColor: "rgb(23,23,23)", borderWidth: 2, hoverOffset: 8,
    }],
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#d4d4d4", font: { size: 12, weight: "600" }, padding: 16 }, position: "bottom" }, tooltip: { backgroundColor: "rgba(31,41,55,0.9)", padding: 12 } },
    cutout: "65%",
  };

  const getMoodBadgeColor = (mood) => {
    const colors = { Happy: "badge-warning", Sad: "badge-error", Angry: "badge-error", Calm: "badge-success", Excited: "badge-primary", Anxious: "badge-error" };
    return colors[mood] || "badge-primary";
  };

  return (
    <AppShell>
      <SEO title="Dashboard" description="Track your emotional wellness journey with ECHONA" path="/dashboard" />

      <div className="relative z-10 pt-14 lg:pt-4 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Options Menu */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-4 right-4 lg:top-4 lg:right-8">
          <OptionsMenu currentPage="/dashboard" />
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="heading-1 mb-2">Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!</h1>
              <p className="text-neutral-300 text-lg">Here's your emotional wellness overview</p>
            </div>
            {/* Live Clock */}
            <div className="text-right hidden sm:block">
              <p className="text-2xl font-mono font-light text-white tracking-wider">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Journal Button (#11) */}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setJournalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 hover:border-violet-500/50 text-violet-400 hover:text-violet-300 transition-all text-sm font-medium"
                aria-label="Open journal"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="hidden sm:inline">Journal</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowClearModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-all text-sm font-medium"
                aria-label="Reset all mood data"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Reset Data</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Mood Insights (#6) */}
        <MoodInsights />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

        {/* Time Filter (#15) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="flex items-center gap-2 mb-6" role="tablist" aria-label="Time range filter">
          {TIME_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTimeFilter(f.key)}
              role="tab"
              aria-selected={timeFilter === f.key}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                timeFilter === f.key
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/40"
                  : "bg-neutral-800/40 text-neutral-400 border border-neutral-700/50 hover:bg-neutral-800/60 hover:text-neutral-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 card-premium p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-glow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <div><h3 className="text-xl font-bold text-neutral-50">Mood Trend</h3><p className="text-xs text-neutral-400">Your emotional journey over time</p></div>
            </div>
            <div className="h-[300px]" role="img" aria-label="Mood trend line chart"><Line data={lineData} options={lineOptions} /></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card-premium p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-glow-sm">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/></svg>
              </div>
              <div><h3 className="text-xl font-bold text-neutral-50">Distribution</h3><p className="text-xs text-neutral-400">Mood breakdown</p></div>
            </div>
            <div className="h-[300px] flex items-center justify-center" role="img" aria-label="Mood distribution doughnut chart">
              <div className="w-full max-w-[250px]"><Doughnut data={doughnutData} options={doughnutOptions} /></div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-600 to-accent-500 flex items-center justify-center shadow-glow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div><h3 className="text-xl font-bold text-neutral-50">Recent Activity</h3><p className="text-xs text-neutral-400">Your latest mood entries</p></div>
            </div>
            <button onClick={() => navigate("/mood-detect")} className="btn-primary text-sm" aria-label="Add a new mood entry">Add New</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.slice().reverse().slice(0, 6).map((entry, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + idx * 0.05 }} whileHover={{ scale: 1.02, y: -4 }} className="card card-hover p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-neutral-100">{entry.mood}</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">{new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <span className={`badge ${getMoodBadgeColor(entry.mood)}`}>{entry.score}/10</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(entry.score / 10) * 100}%` }} transition={{ delay: 0.8 + idx * 0.05, duration: 0.6 }} className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 text-center">
          <p className="text-neutral-300 text-sm mb-4">Ready for more?</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => navigate("/music")} className="btn-secondary text-sm" aria-label="Go to Music page"><Icons.Music />Explore Music</button>
            <button onClick={() => navigate("/todo")} className="btn-secondary text-sm" aria-label="Go to Planner page"><Icons.Todo />View Planner</button>
          </div>
        </motion.div>
      </div>

      {/* Journal Modal (#11) */}
      <JournalModal isOpen={journalOpen} onClose={() => setJournalOpen(false)} mood={todayMood} />

      {/* Clear Data Modal (#4 — uses toast, not alert) */}
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} whileHover={{ y: -4 }} className="card card-hover p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-glow-sm`}>{icon}</div>
      </div>
      <div>
        <p className="text-sm text-neutral-300 mb-1">{title}</p>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-xs text-neutral-400">{subtitle}</p>
      </div>
    </motion.div>
  );
}

export default Dashboard;
