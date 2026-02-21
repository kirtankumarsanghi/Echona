import { motion } from "framer-motion";
import { useMood } from "../context/MoodContext";

/**
 * Weekly mood insights card for Dashboard (#6)
 */
function MoodInsights() {
  const { getInsights } = useMood();
  const insights = getInsights();

  if (!insights) return null;

  const trendIcon = insights.trend === "improving" ? "📈" :
                    insights.trend === "declining" ? "📉" : "➡️";

  const trendColor = insights.trend === "improving" ? "text-emerald-400" :
                     insights.trend === "declining" ? "text-amber-400" : "text-neutral-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card-premium p-6 mb-8 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-600/10 to-violet-600/10 rounded-full blur-2xl" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-glow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-100">Weekly Insights</h3>
            <p className="text-xs text-neutral-500">{insights.entriesThisWeek} entries this week</p>
          </div>
          <span className={`ml-auto text-2xl`}>{trendIcon}</span>
        </div>

        <p className="text-neutral-300 text-sm leading-relaxed mb-4">{insights.message}</p>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-neutral-800/50 rounded-xl p-3 text-center">
            <p className="text-xs text-neutral-500 mb-1">Dominant</p>
            <p className="text-sm font-bold text-neutral-100">{insights.dominant}</p>
          </div>
          <div className="bg-neutral-800/50 rounded-xl p-3 text-center">
            <p className="text-xs text-neutral-500 mb-1">Avg Score</p>
            <p className="text-sm font-bold text-neutral-100">{insights.avgScore}/10</p>
          </div>
          <div className="bg-neutral-800/50 rounded-xl p-3 text-center">
            <p className="text-xs text-neutral-500 mb-1">Trend</p>
            <p className={`text-sm font-bold capitalize ${trendColor}`}>{insights.trend}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MoodInsights;
