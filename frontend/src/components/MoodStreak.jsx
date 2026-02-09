import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

function MoodStreak() {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const response = await axiosInstance.get("/api/mood");
      const moods = response.data;

      if (moods.length === 0) {
        setStreak(0);
        setBestStreak(0);
        setLoading(false);
        return;
      }

      // Calculate current streak
      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Sort moods by date (newest first)
      const sortedMoods = moods.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Check if user logged mood today
      const lastMoodDate = new Date(sortedMoods[0].timestamp);
      lastMoodDate.setHours(0, 0, 0, 0);
      
      let checkDate = new Date(today);
      
      for (let i = 0; i < sortedMoods.length; i++) {
        const moodDate = new Date(sortedMoods[i].timestamp);
        moodDate.setHours(0, 0, 0, 0);
        
        if (moodDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          tempStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // Streak broken
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 0;
          break;
        }
      }
      
      maxStreak = Math.max(maxStreak, tempStreak, currentStreak);
      
      setStreak(currentStreak);
      setBestStreak(maxStreak);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching streak:", error);
      setStreak(0);
      setBestStreak(0);
      setLoading(false);
    }
  };

  const getStreakEmoji = () => {
    if (streak === 0) return "😴";
    if (streak < 3) return "🌱";
    if (streak < 7) return "🔥";
    if (streak < 14) return "⚡";
    if (streak < 30) return "🚀";
    return "👑";
  };

  const getStreakMessage = () => {
    if (streak === 0) return "Start your streak today!";
    if (streak === 1) return "Great start! Keep it going!";
    if (streak < 7) return "You're on fire!";
    if (streak < 30) return "Amazing dedication!";
    return "You're a mood tracking champion!";
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
      >
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-16 bg-gray-700 rounded"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-orange-500/20 via-yellow-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-3xl">{getStreakEmoji()}</span>
          Mood Streak
        </h3>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-2xl"
        >
          🔥
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm mb-1">Current Streak</p>
          <p className="text-4xl font-bold text-yellow-400">{streak}</p>
          <p className="text-gray-500 text-xs">days</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm mb-1">Best Streak</p>
          <p className="text-4xl font-bold text-orange-400">{bestStreak}</p>
          <p className="text-gray-500 text-xs">days</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20">
        <p className="text-white font-semibold text-center">{getStreakMessage()}</p>
      </div>

      {/* Streak Milestones */}
      <div className="mt-4 space-y-2">
        <p className="text-gray-400 text-xs font-semibold mb-2">MILESTONES</p>
        <div className="flex gap-2">
          {[3, 7, 14, 30, 60, 100].map((milestone) => (
            <motion.div
              key={milestone}
              whileHover={{ scale: 1.1 }}
              className={`flex-1 text-center py-2 rounded-lg ${
                bestStreak >= milestone
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                  : "bg-gray-700/50 text-gray-500"
              }`}
            >
              <p className="text-xs font-bold">{milestone}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default MoodStreak;
