import { useState } from "react";
import { motion } from "framer-motion";
import axiosInstance from "./api/axiosInstance";

const moods = [
  { label: "Happy", emoji: "😊", color: "from-yellow-400 to-yellow-600", gradient: "bg-yellow-500/10" },
  { label: "Sad", emoji: "😢", color: "from-blue-500 to-blue-700", gradient: "bg-blue-500/10" },
  { label: "Angry", emoji: "😠", color: "from-red-500 to-red-700", gradient: "bg-red-500/10" },
  { label: "Anxious", emoji: "😰", color: "from-purple-500 to-purple-700", gradient: "bg-purple-500/10" },
  { label: "Calm", emoji: "😌", color: "from-green-400 to-green-600", gradient: "bg-green-500/10" },
  { label: "Excited", emoji: "🤩", color: "from-pink-500 to-pink-700", gradient: "bg-pink-500/10" },
];

export default function MoodSelector({ onMoodSelected, isLoading }) {
  const [selectedMood, setSelectedMood] = useState(null);

  const handleMoodSelect = async (moodLabel) => {
    setSelectedMood(moodLabel);

    try {
      console.log("[MoodSelector] Saving mood:", moodLabel);
      const token = localStorage.getItem("echona_token");
      console.log("[MoodSelector] Token available:", !!token);

      const response = await axiosInstance.post("/api/mood/add", {
        mood: moodLabel,
        score: Math.floor(Math.random() * 10) + 1,
      });

      console.log("[MoodSelector] Mood saved successfully:", response.data);
      if (onMoodSelected) {
        onMoodSelected(moodLabel);
      }
    } catch (err) {
      console.error("[MoodSelector] Error saving mood:", err);
      console.error("[MoodSelector] Error response:", err.response?.data);
      console.error("[MoodSelector] Error status:", err.response?.status);

      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to save mood";
      alert(`Failed to save mood: ${errorMessage}`);
      setSelectedMood(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8"
    >
      {moods.map((mood) => (
        <motion.button
          key={mood.label}
          variants={itemVariants}
          whileHover={{ y: -8 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleMoodSelect(mood.label)}
          disabled={isLoading && selectedMood !== mood.label}
          className={`relative group cursor-pointer transition-all duration-300 ${
            isLoading && selectedMood !== mood.label ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {/* Glow Effect */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${mood.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
          />

          {/* Card */}
          <div
            className={`relative p-8 rounded-3xl border border-gray-700 group-hover:border-gray-500 transition-all duration-300 ${mood.gradient} backdrop-blur-xl`}
          >
            {/* Success Checkmark */}
            {selectedMood === mood.label && isLoading && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center rounded-3xl bg-gradient-to-br from-green-400 to-green-600"
              >
                <motion.svg
                  initial={{ rotate: -180 }}
                  animate={{ rotate: 0 }}
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </motion.div>
            )}

            {/* Content */}
            <div
              className={`text-center transition-opacity duration-300 ${
                selectedMood === mood.label && isLoading ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="text-6xl md:text-7xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {mood.emoji}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-100 group-hover:text-white transition-colors">
                {mood.label}
              </h3>
            </div>

            {/* Hover Shine Effect */}
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12" />
            </div>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
