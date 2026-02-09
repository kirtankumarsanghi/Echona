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

ChartJS.register(
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

// Helper function to get mood emoji
const getMoodEmoji = (mood) => {
  const emojis = {
    Happy: "😊",
    Sad: "😢",
    Angry: "😠",
    Calm: "😌",
    Excited: "🤩",
    Anxious: "😰",
  };
  return emojis[mood] || "😐";
};

// Helper function to get mood color
const getMoodColor = (mood) => {
  const colors = {
    Happy: "from-yellow-400 to-yellow-600",
    Sad: "from-blue-400 to-blue-600",
    Angry: "from-red-400 to-red-600",
    Calm: "from-green-400 to-green-600",
    Excited: "from-pink-400 to-pink-600",
    Anxious: "from-purple-400 to-purple-600",
  };
  return colors[mood] || "from-gray-400 to-gray-600";
};

function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    axiosInstance
      .get("/api/mood/history")
      .then((res) => setHistory(res.data))
      .catch((err) => console.log(err));
  }, []);

  if (!history.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-black text-white flex flex-col items-center justify-center p-4 pt-28 overflow-hidden">
        
        {/* Background Blobs */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -40, 20, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
          />
          <motion.div
            animate={{
              x: [0, -40, 20, 0],
              y: [0, 40, -20, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
          />
        </div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="text-7xl mb-8 inline-block"
          >
            📊
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            No Mood Data Yet
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-md">Start tracking your mood to see detailed analytics and patterns about your emotional journey</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/detect")}
            className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl font-bold text-lg shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            ▶ Detect Your Mood
          </motion.button>
        </motion.div>

        {/* MoodStats Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 max-w-7xl mx-auto mt-8"
        >
          <MoodStats />
        </motion.div>

        {/* Motivational Quote Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 max-w-4xl mx-auto mt-16 mb-8"
        >
          <div className="text-center p-8 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 backdrop-blur-xl">
            <p className="text-gray-400 text-sm mb-2">💭 Daily Inspiration</p>
            <p className="text-xl md:text-2xl font-semibold text-white italic mb-3">
              "The best time to start tracking your emotions was yesterday. The second best time is now."
            </p>
            <p className="text-cyan-400 text-sm">— Your Wellness Journey</p>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-black text-white p-6 md:p-10 pt-28 overflow-hidden">
      
      {/* Animated Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -50, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
        />
        <motion.div
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 50, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex items-center justify-between"
        >
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 text-lg font-medium mb-4 transition-colors"
            >
              ← Back to Home
            </button>
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-2">
              Your Emotional Journey
            </h1>
            <p className="text-gray-300 text-lg">Track patterns and insights about your mood</p>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {/* Today's Mood */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -8 }}
            className={`bg-gradient-to-br ${getMoodColor(todayMood)} p-8 rounded-3xl shadow-2xl border border-opacity-20 border-white backdrop-blur-xl`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-100 text-sm font-medium mb-2">Today's Mood</p>
                <div className="text-7xl mb-3">{getMoodEmoji(todayMood)}</div>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{todayMood}</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm text-gray-100">Score: <span className="font-bold text-xl">{todayScore}/10</span></p>
            </div>
          </motion.div>

          {/* Average Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -8 }}
            className="bg-gradient-to-br from-blue-600/80 to-cyan-600/80 p-8 rounded-3xl shadow-2xl border border-opacity-20 border-white backdrop-blur-xl"
          >
            <p className="text-gray-100 text-sm font-medium mb-4">Average Score</p>
            <p className="text-6xl font-black text-white mb-3">{avgScore}</p>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full" style={{ width: `${(avgScore / 10) * 100}%` }} />
            </div>
            <p className="text-sm text-gray-100 mt-3">out of 10</p>
          </motion.div>

          {/* Best Day */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -8 }}
            className="bg-gradient-to-br from-green-600/80 to-emerald-600/80 p-8 rounded-3xl shadow-2xl border border-opacity-20 border-white backdrop-blur-xl"
          >
            <p className="text-gray-100 text-sm font-medium mb-4">Best Day</p>
            <p className="text-5xl font-black text-white mb-3">{best.score}</p>
            <p className="text-lg text-gray-100"><span className="text-3xl">{getMoodEmoji(best.mood)}</span> {best.mood}</p>
          </motion.div>

          {/* Total Entries */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -8 }}
            className="bg-gradient-to-br from-purple-600/80 to-pink-600/80 p-8 rounded-3xl shadow-2xl border border-opacity-20 border-white backdrop-blur-xl"
          >
            <p className="text-gray-100 text-sm font-medium mb-4">Total Entries</p>
            <p className="text-6xl font-black text-white mb-3">{history.length}</p>
            <p className="text-sm text-gray-100">mood records tracked</p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ border: "border-cyan-400/50" }}
            className="bg-gradient-to-br from-gray-800/40 to-gray-800/20 backdrop-blur-xl p-8 rounded-3xl border border-gray-700/50 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">📈</span>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Mood Trend</h2>
            </div>
            <Line data={lineData} options={lineOptions} />
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ border: "border-purple-400/50" }}
            className="bg-gradient-to-br from-gray-800/40 to-gray-800/20 backdrop-blur-xl p-8 rounded-3xl border border-gray-700/50 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🎯</span>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Mood Distribution</h2>
            </div>
            <Pie data={pieData} options={pieOptions} />
          </motion.div>
        </div>

        {/* New Features Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Mood Streak */}
          <MoodStreak />

          {/* Daily Affirmation */}
          <DailyAffirmation />
        </div>

        {/* Recent Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-gray-800/40 to-gray-800/20 backdrop-blur-xl p-8 rounded-3xl border border-gray-700/50 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📋</span>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">Recent Entries</h2>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
            {history.slice().reverse().slice(0, 8).map((entry, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * idx }}
                whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.08)" }}
                className="flex items-center justify-between p-5 bg-gray-700/30 hover:bg-gray-700/50 rounded-2xl border border-gray-600/30 transition-all group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-5xl group-hover:scale-110 transition-transform">{getMoodEmoji(entry.mood)}</div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-white">{entry.mood}</p>
                    <p className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{entry.score}</p>
                  <p className="text-xs text-gray-400">/10</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Motivational Quote Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 mb-8"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-purple-500/30 p-10 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/5 to-purple-500/0" />
            <div className="relative text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl mb-4 inline-block"
              >
                ✨
              </motion.div>
              <p className="text-sm text-gray-400 mb-3 uppercase tracking-wider">Daily Wisdom</p>
              <p className="text-2xl md:text-3xl font-bold text-white italic leading-relaxed mb-4">
                "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity."
              </p>
              <p className="text-cyan-400 font-medium">— Keep Growing 🌱</p>
            </div>
          </div>
        </motion.div>
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
