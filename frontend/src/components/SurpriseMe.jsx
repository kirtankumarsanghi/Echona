import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

function SurpriseMe() {
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [surpriseData, setSurpriseData] = useState(null);
  const [error, setError] = useState(null);

  const handleSurpriseMe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const detectedEmotion = localStorage.getItem('detected_mood');
      let response;

      if (detectedEmotion) {
        response = await axiosInstance.post("/api/surprise", { mlEmotion: detectedEmotion });
      } else {
        response = await axiosInstance.get("/api/surprise");
      }

      if (response.data && response.data.success) {
        setSurpriseData(response.data);
        setShowResult(true);

        if (response.data.track?.youtubeId) {
          window.open(`https://www.youtube.com/watch?v=${response.data.track.youtubeId}`, '_blank');
        }
      } else {
        setError("Couldn't find a recommendation right now");
      }
    } catch (err) {
      setError("Unable to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeResult = () => {
    setShowResult(false);
    setSurpriseData(null);
  };

  const getContextText = (context) => {
    if (!context) return "";
    const parts = [];
    if (context.time) parts.push(context.time.charAt(0).toUpperCase() + context.time.slice(1));
    if (context.weather && context.weather !== "unknown") {
      parts.push(context.weather.charAt(0).toUpperCase() + context.weather.slice(1));
    }
    return parts.join(" · ");
  };

  const getMoodAccent = (mood) => {
    const accents = {
      Happy: "text-amber-400",
      Calm: "text-emerald-400",
      Excited: "text-pink-400",
      Sad: "text-blue-400",
      Angry: "text-rose-400",
      Anxious: "text-purple-400"
    };
    return accents[mood] || "text-neutral-400";
  };

  return (
    <>
      {/* AI Recommendation Card — calm, secondary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-5 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-200">AI Recommendation</h4>
              <p className="text-[11px] text-neutral-500">
                {localStorage.getItem('detected_mood')
                  ? "Based on your emotion & environment"
                  : "Based on time of day & weather"
                }
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSurpriseMe}
            disabled={isLoading}
            className={`px-5 py-2 bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700/50 text-neutral-200 text-sm font-medium rounded-full transition-all flex items-center gap-2 ${
              isLoading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-neutral-400">Finding...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Surprise Me
              </>
            )}
          </motion.button>
        </div>

        {/* Error — subtle inline */}
        {error && (
          <div className="mt-3 px-3 py-2 bg-red-500/5 border border-red-500/15 rounded-lg">
            <p className="text-red-400/80 text-xs">{error}</p>
          </div>
        )}
      </motion.div>

      {/* Result Modal — clean, calm */}
      <AnimatePresence>
        {showResult && surpriseData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeResult}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-neutral-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                    {surpriseData.mlEmotion ? "Emotion + Context Aware" : "Context Aware"}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-neutral-100 mb-1">Perfect match found</h3>
                <p className="text-neutral-500 text-xs">
                  {getContextText(surpriseData.context)}
                  {surpriseData.mlEmotion && (
                    <span className={`ml-1 ${getMoodAccent(surpriseData.context?.moodUsed)}`}>
                      · {surpriseData.mlEmotion}
                    </span>
                  )}
                </p>
              </div>

              {/* Song Details */}
              <div className="p-6">
                <div className="mb-5">
                  {surpriseData.context?.moodUsed && (
                    <span className={`inline-block text-[10px] px-2.5 py-1 rounded-full font-semibold mb-3 bg-neutral-800 ${getMoodAccent(surpriseData.context.moodUsed)}`}>
                      {surpriseData.context.moodUsed}
                    </span>
                  )}
                  <h2 className="text-xl font-semibold text-neutral-100 mb-1">
                    {surpriseData.track.title}
                  </h2>
                  <p className="text-neutral-400 text-sm">{surpriseData.track.artist}</p>
                  {surpriseData.track.genre && (
                    <span className="inline-block text-[10px] px-2 py-0.5 bg-neutral-800/60 text-neutral-500 rounded-full mt-2 font-medium">
                      {surpriseData.track.genre}
                    </span>
                  )}
                </div>

                {/* Context Explanation — gentle */}
                <div className="bg-neutral-800/30 border border-neutral-800/50 rounded-xl px-4 py-3 mb-5">
                  <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold mb-1.5">Why this song?</p>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    {surpriseData.mlEmotion && (
                      <span className="text-indigo-400">Your mood guided this choice. </span>
                    )}
                    {surpriseData.context?.time === "morning" && "Morning energy calls for uplifting music."}
                    {surpriseData.context?.time === "afternoon" && "Afternoon vibes match this selection perfectly."}
                    {surpriseData.context?.time === "evening" && "Evening time pairs well with this mood."}
                    {surpriseData.context?.time === "night" && "Late night atmosphere enhances this track."}
                  </p>
                </div>

                {/* Actions — clean buttons */}
                <div className="flex gap-2.5">
                  <a
                    href={`https://www.youtube.com/watch?v=${surpriseData.track.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-white text-neutral-900 rounded-xl font-semibold text-sm text-center transition-all hover:shadow-md"
                  >
                    Play Now
                  </a>
                  <button
                    onClick={() => {
                      closeResult();
                      setTimeout(() => handleSurpriseMe(), 300);
                    }}
                    className="flex-1 py-2.5 bg-neutral-800/60 hover:bg-neutral-700/60 border border-neutral-700/50 text-neutral-300 rounded-xl text-sm font-medium transition-all"
                  >
                    Try Another
                  </button>
                </div>
                <button
                  onClick={closeResult}
                  className="w-full mt-2.5 py-2 text-neutral-600 hover:text-neutral-400 text-xs font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SurpriseMe;
