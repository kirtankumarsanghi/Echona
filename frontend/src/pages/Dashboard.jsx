import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "../components/AppShell";
import OptionsMenu from "../components/OptionsMenu";
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
import { useNavigate, NavLink } from "react-router-dom";
import { logout, getCurrentUser } from "../utils/auth";

ChartJS.register(
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

// Sidebar navigation icon components
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  MoodDetect: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
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
  Logout: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const user = getCurrentUser();

  useEffect(() => {
    // Load mood history from localStorage
    try {
      const storedHistory = localStorage.getItem('echona_mood_history');
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        setHistory(parsed);
      } else {
        // Start with empty history - user will build their own data
        setHistory([]);
      }
    } catch (err) {
      console.error('Error loading mood history:', err);
      setHistory([]);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  // Empty state if no data
  if (!history.length) {
    return (
      <AppShell>
        <div className="h-full flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-lg"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-600 to-primary-500 rounded-3xl flex items-center justify-center shadow-glow">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="heading-2 mb-4">No Mood Data Yet</h2>
            <p className="text-muted mb-8">Start tracking your emotional wellness journey today</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/mood-detect")}
              className="btn-primary"
            >
              Start Detecting Mood
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  // Calculate statistics
  const today = history[history.length - 1];
  const todayMood = today.mood;
  const todayScore = today.score;
  
  const avgScore = (
    history.reduce((sum, item) => sum + item.score, 0) / history.length
  ).toFixed(1);

  const best = history.reduce((a, b) => (a.score > b.score ? a : b));
  const worst = history.reduce((a, b) => (a.score < b.score ? a : b));

  // Chart configurations
  const lineData = {
    labels: history.map((h) => new Date(h.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: "Mood Score",
        data: history.map((h) => h.score),
        borderColor: "rgb(139, 92, 246)",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(139, 92, 246)",
        pointBorderColor: "rgb(31, 41, 55)",
        pointBorderWidth: 2,
        borderWidth: 3,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        grid: { color: "rgba(115, 115, 115, 0.1)", drawBorder: false },
        ticks: { color: "#a3a3a3", font: { size: 12 } },
        max: 10,
        beginAtZero: true,
      },
      x: {
        grid: { display: false },
        ticks: { color: "#a3a3a3", font: { size: 11 } },
      },
    },
  };

  // Mood distribution
  const moodCounts = {};
  history.forEach((h) => {
    moodCounts[h.mood] = (moodCounts[h.mood] || 0) + 1;
  });

  const doughnutData = {
    labels: Object.keys(moodCounts),
    datasets: [
      {
        data: Object.values(moodCounts),
        backgroundColor: [
          "rgb(251, 191, 36)",
          "rgb(56, 189, 248)",
          "rgb(248, 113, 113)",
          "rgb(52, 211, 153)",
          "rgb(244, 114, 182)",
          "rgb(167, 139, 250)",
        ],
        borderColor: "rgb(23, 23, 23)",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        labels: { 
          color: "#d4d4d4",
          font: { size: 12, weight: "600" },
          padding: 16,
        },
        position: "bottom",
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
      },
    },
    cutout: '65%',
  };

  const getMoodBadgeColor = (mood) => {
    const colors = {
      Happy: "badge-warning",
      Sad: "badge-error",
      Angry: "badge-error",
      Calm: "badge-success",
      Excited: "badge-primary",
      Anxious: "badge-error",
    };
    return colors[mood] || "badge-primary";
  };

  return (
    <AppShell>
      <div className="relative z-10 pt-14 lg:pt-4 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Options Menu - Top Right */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 right-4 lg:top-4 lg:right-8"
            >
              <OptionsMenu currentPage="/dashboard" />
            </motion.div>

            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="heading-1 mb-2">
                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
              </h1>
              <p className="text-neutral-300 text-lg">Here's your emotional wellness overview</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Today's Mood"
                value={todayMood}
                subtitle={`${todayScore}/10`}
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                gradient="from-primary-600 to-primary-500"
                delay={0}
              />
              <StatCard
                title="Average Score"
                value={avgScore}
                subtitle="Overall rating"
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                gradient="from-secondary-600 to-secondary-500"
                delay={0.1}
              />
              <StatCard
                title="Best Day"
                value={best.score}
                subtitle={best.mood}
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                }
                gradient="from-accent-600 to-accent-500"
                delay={0.2}
              />
              <StatCard
                title="Total Entries"
                value={history.length}
                subtitle="Tracked moods"
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                gradient="from-purple-600 to-pink-600"
                delay={0.3}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Line Chart - Takes 2 columns */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 card-premium p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-glow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-50">Mood Trend</h3>
                    <p className="text-xs text-neutral-400">Your emotional journey over time</p>
                  </div>
                </div>
                <div className="h-[300px]">
                  <Line data={lineData} options={lineOptions} />
                </div>
              </motion.div>

              {/* Doughnut Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card-premium p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-glow-sm">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-50">Distribution</h3>
                    <p className="text-xs text-neutral-400">Mood breakdown</p>
                  </div>
                </div>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="w-full max-w-[250px]">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card-premium p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-600 to-accent-500 flex items-center justify-center shadow-glow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-50">Recent Activity</h3>
                    <p className="text-xs text-neutral-400">Your latest mood entries</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate("/mood-detect")}
                  className="btn-primary text-sm"
                >
                  Add New
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.slice().reverse().slice(0, 6).map((entry, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + (idx * 0.05) }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="card card-hover p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-neutral-100">{entry.mood}</h4>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {new Date(entry.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className={`badge ${getMoodBadgeColor(entry.mood)}`}>
                        {entry.score}/10
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(entry.score / 10) * 100}%` }}
                        transition={{ delay: 0.8 + (idx * 0.05), duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-center"
            >
              <p className="text-neutral-300 text-sm mb-4">Ready for more?</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button onClick={() => navigate("/music")} className="btn-secondary text-sm">
                  <Icons.Music />
                  Explore Music
                </button>
                <button onClick={() => navigate("/todo")} className="btn-secondary text-sm">
                  <Icons.Todo />
                  View Planner
                </button>
              </div>
            </motion.div>
      </div>
    </AppShell>
  );
}



// Stat Card Component
function StatCard({ title, value, subtitle, icon, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="card card-hover p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-glow-sm`}>
          {icon}
        </div>
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