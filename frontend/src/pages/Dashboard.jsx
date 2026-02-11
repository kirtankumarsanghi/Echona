import axiosInstance from "../api/axiosInstance";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import MoodStats from "../components/MoodStats";
import ThemeToggle from "../components/ThemeToggle";
import QuickActions from "../components/QuickActions";
import { useToast } from "../components/Toast";
import MoodStreak from "../components/MoodStreak";
import DailyAffirmation from "../components/DailyAffirmation";
import BreathingExercise from "../components/BreathingExercise";
import MeditationTimer from "../components/MeditationTimer";
import Navbar from "../components/Navbar";

ChartJS.register(
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

// Helper function to get mood color
const getMoodColor = (mood) => {
  const colors = {
    Happy: "from-amber-400 to-orange-500",
    Sad: "from-slate-400 to-slate-600",
    Angry: "from-rose-500 to-red-600",
    Calm: "from-teal-400 to-emerald-500",
    Excited: "from-orange-400 to-rose-500",
    Anxious: "from-purple-400 to-violet-600",
  };
  return colors[mood] || "from-gray-400 to-gray-600";
};

function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    // Load mood history from localStorage
    try {
      const storedHistory = localStorage.getItem('echona_mood_history');
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        setHistory(parsed);
      } else {
        // Generate some sample data for demo
        const sampleData = [
          { mood: "Happy", score: 8, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
          { mood: "Calm", score: 7, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
          { mood: "Excited", score: 9, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
          { mood: "Anxious", score: 4, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
          { mood: "Happy", score: 8, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
          { mood: "Sad", score: 3, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          { mood: "Calm", score: 7, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
          { mood: "Happy", score: 9, createdAt: new Date().toISOString() },
        ];
        localStorage.setItem('echona_mood_history', JSON.stringify(sampleData));
        setHistory(sampleData);
      }
    } catch (err) {
      console.error('Error loading mood history:', err);
    }
  }, []);

  if (!history.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
        
        {/* Navbar */}
        <Navbar />
        
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none opacity-20">
          <motion.div
            animate={{ x: [0, 40, -20, 0], y: [0, -40, 20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-10 w-72 h-72 bg-amber-500/30 rounded-full mix-blend-screen filter blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -40, 20, 0], y: [0, 40, -20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/30 rounded-full mix-blend-screen filter blur-3xl"
          />
        </div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center relative z-10 pt-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            No Mood Data Yet
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-md">Start tracking your mood to see detailed analytics</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/mood-detect")}
            className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold text-lg shadow-lg transition-all"
          >
            Start Detecting →
          </motion.button>
        </motion.div>
      </div>
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

  // Line chart data
  const lineData = {
    labels: history.map((h) =>
      new Date(h.createdAt).toLocaleDateString("en-IN")
    ),
    datasets: [
      {
        label: "Mood Score",
        data: history.map((h) => h.score),
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6,182,212,0.1)",
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "#06b6d4",
        pointBorderColor: "#0f172a",
        pointBorderWidth: 2,
        borderWidth: 3,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { 
        labels: { 
          color: "#fff",
          font: { size: 14, weight: "bold" }
        },
      },
    },
    scales: {
      y: {
        grid: { color: "rgba(255,255,255,0.1)", drawBorder: false },
        ticks: { color: "#fff", font: { size: 12 } },
        max: 10,
        beginAtZero: true,
      },
      x: {
        grid: { color: "rgba(255,255,255,0.05)", drawBorder: false },
        ticks: { color: "#fff", font: { size: 12 } },
      },
    },
  };

  // Pie chart data
  const moodCounts = {};
  history.forEach((h) => {
    moodCounts[h.mood] = (moodCounts[h.mood] || 0) + 1;
  });

  const pieData = {
    labels: Object.keys(moodCounts),
    datasets: [
      {
        data: Object.values(moodCounts),
        backgroundColor: [
          "#fbbf24",
          "#38bdf8",
          "#f87171",
          "#34d399",
          "#f472b6",
          "#a78bfa",
        ],
        borderColor: "#0f172a",
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { 
      legend: { 
        labels: { 
          color: "#fff",
          font: { size: 12, weight: "bold" },
          padding: 20,
        },
        position: "bottom",
      } 
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 dark:from-indigo-950 dark:via-purple-900 dark:to-slate-950 light-mode:from-indigo-50 light-mode:via-purple-50 light-mode:to-slate-50 text-[var(--text-primary)] overflow-hidden relative transition-colors duration-300">
      
      {/* Navbar */}
      <Navbar />
      
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 200, -100, 0],
            y: [0, -150, 100, 0],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-violet-500/30 rounded-full mix-blend-screen filter blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            x: [0, -200, 100, 0],
            y: [0, 150, -100, 0],
          }}
          transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 w-[700px] h-[700px] bg-gradient-to-br from-cyan-500/30 via-blue-500/30 to-teal-500/30 rounded-full mix-blend-screen filter blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 100, -50, 0],
            y: [0, -50, 100, 0],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-rose-500/20 rounded-full mix-blend-screen filter blur-[100px]"
        />
      </div>

      <div className="relative z-10 px-6 pt-36 pb-12 max-w-7xl mx-auto">
        
        {/* Hero Section with Floating Stats */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-sm text-white/90 transition-all group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Home</span>
          </motion.button>

          <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400"
          >
            Your Mood Journey
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-white/60 mb-8"
          >
            Emotional insights that matter
          </motion.p>

          {/* Floating Circular Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 p-1 shadow-2xl shadow-pink-500/50">
                <div className="w-full h-full rounded-full bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center">
                  <p className="text-xs text-white/60 mb-1">Today</p>
                  <p className="text-2xl font-black text-white">{todayMood}</p>
                  <p className="text-xs text-pink-400">{todayScore}/10</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring" }}
              whileHover={{ scale: 1.1, rotate: -5 }}
              className="relative"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 p-1 shadow-2xl shadow-cyan-500/50">
                <div className="w-full h-full rounded-full bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center">
                  <p className="text-xs text-white/60 mb-1">Average</p>
                  <p className="text-4xl font-black text-white">{avgScore}</p>
                  <p className="text-xs text-cyan-400">score</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 p-1 shadow-2xl shadow-amber-500/50">
                <div className="w-full h-full rounded-full bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center">
                  <p className="text-xs text-white/60 mb-1">Best Day</p>
                  <p className="text-4xl font-black text-white">{best.score}</p>
                  <p className="text-xs text-amber-400">{best.mood}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7, type: "spring" }}
              whileHover={{ scale: 1.1, rotate: -5 }}
              className="relative"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 p-1 shadow-2xl shadow-purple-500/50">
                <div className="w-full h-full rounded-full bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center">
                  <p className="text-xs text-white/60 mb-1">Entries</p>
                  <p className="text-4xl font-black text-white">{history.length}</p>
                  <p className="text-xs text-purple-400">total</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Organic Flowing Layout - No Grid */}
        <div className="space-y-8">
          
          {/* Large Trend Card - Flowing Design */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 rounded-3xl blur-xl opacity-30"></div>
            <div className="relative bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </motion.div>
                <div>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    Emotional Trend
                  </h2>
                  <p className="text-sm text-white/50">Your journey over time</p>
                </div>
              </div>
              <div className="mt-6">
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
          </motion.div>

          {/* Dual Cards - Side by Side but Organic */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Pie Chart - Tilted Card */}
            <motion.div
              initial={{ opacity: 0, rotate: -5, y: 50 }}
              animate={{ opacity: 1, rotate: 0, y: 0 }}
              transition={{ delay: 0.9, type: "spring" }}
              whileHover={{ rotate: 2, scale: 1.02 }}
              className="flex-1 relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Mood Split</h3>
                    <p className="text-xs text-white/50">Distribution</p>
                  </div>
                </div>
                <div className="flex items-center justify-center mt-4">
                  <div className="w-full max-w-[300px]">
                    <Pie data={pieData} options={pieOptions} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Insights Stack */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex-1 space-y-4"
            >
              <MoodStreak />
              <DailyAffirmation />
            </motion.div>
          </div>

          {/* Recent History - Wave Design */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 rounded-3xl blur-xl opacity-30"></div>
            <div className="relative bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Recent History</h3>
                  <p className="text-xs text-white/50">Your latest moods</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                {history.slice().reverse().slice(0, 6).map((entry, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + (idx * 0.1) }}
                    whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? 2 : -2 }}
                    className={`relative p-5 rounded-2xl bg-gradient-to-br ${getMoodColor(entry.mood)} shadow-lg overflow-hidden group cursor-pointer`}
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-2xl font-black text-white">{entry.mood}</p>
                          <p className="text-xs text-white/80">{new Date(entry.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-black text-white/90">{entry.score}</p>
                          <p className="text-xs text-white/70">/10</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quote - Floating Design */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
            whileHover={{ scale: 1.02 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-full blur-2xl opacity-40"></div>
            <div className="relative bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 shadow-2xl text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block mb-6"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </motion.div>
              <p className="text-2xl md:text-3xl font-bold text-white mb-4 leading-relaxed">
                "Every mood tells a story. Keep tracking, keep growing."
              </p>
              <p className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                — Your Wellness Journey ✨
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Theme Toggle & Toast */}
      <ThemeToggle />
      <QuickActions />
      <BreathingExercise />
      <MeditationTimer />
      <ToastContainer />
    </div>
  );
}

export default Dashboard;
