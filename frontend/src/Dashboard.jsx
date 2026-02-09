
import { useEffect, useState } from "react";
import axiosInstance from "./api/axiosInstance";


export default function Dashboard() {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/api/mood/history")
      .then((res) => {
        setMoods(res.data);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const getMoodColor = (mood) => {
    const colors = {
      "Happy": "bg-yellow-500",
      "Sad": "bg-blue-500",
      "Angry": "bg-red-500",
      "Anxious": "bg-purple-500",
      "Calm": "bg-green-500",
      "Excited": "bg-pink-500",
    };
    return colors[mood] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white">
      <div className="max-w-5xl mx-auto mt-20">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-10 shadow-2xl mb-6">
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          <p className="text-xl mb-6">Welcome! Mood history is now public for demo purposes.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-10 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6">Mood History</h2>
          {loading ? (
            <p className="text-lg">Loading mood data...</p>
          ) : moods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moods.map((mood) => (
                <div
                  key={mood._id}
                  className={`${getMoodColor(mood.mood)} p-6 rounded-xl shadow-lg`}
                >
                  <p className="text-lg font-semibold">{mood.mood}</p>
                  <p className="text-sm mt-2">Score: {mood.score}/10</p>
                  <p className="text-xs mt-2 opacity-80">
                    {new Date(mood.createdAt).toLocaleDateString()} {new Date(mood.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-lg text-gray-300">
              No mood data yet... Try adding moods!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
