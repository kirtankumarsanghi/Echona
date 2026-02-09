import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const MoodStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/api/mood/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-gray-800/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: "Total Moods", value: stats.total || 0, icon: "📊", color: "from-blue-500 to-cyan-500" },
    { label: "This Week", value: stats.thisWeek || 0, icon: "📅", color: "from-purple-500 to-pink-500" },
    { label: "Current Streak", value: `${stats.streak || 0} days`, icon: "🔥", color: "from-orange-500 to-red-500" },
    { label: "Most Common", value: stats.mostCommon || "-", icon: "⭐", color: "from-green-500 to-emerald-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          className="relative group"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity`} />
          <div className="relative p-6 rounded-2xl bg-gray-800/50 backdrop-blur-xl border border-gray-700 group-hover:border-gray-500 transition-all">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MoodStats;
