import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * Illustrated empty state component for pages with no data (#17)
 */
function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionPath,
  actionOnClick,
  secondaryLabel,
  secondaryPath,
}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
      >
        {/* Icon container with animated gradient */}
        <div className="relative mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 flex items-center justify-center"
          >
            {icon || (
              <svg className="w-14 h-14 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            )}
          </motion.div>
          {/* Decorative dots */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-indigo-500/30"
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-violet-500/30"
          />
        </div>

        <h3 className="text-2xl font-bold text-neutral-100 mb-3">{title}</h3>
        <p className="text-neutral-400 max-w-md mx-auto mb-8 leading-relaxed">{description}</p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {(actionLabel && (actionPath || actionOnClick)) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={actionOnClick || (() => navigate(actionPath))}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              {actionLabel}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          )}
          {secondaryLabel && secondaryPath && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(secondaryPath)}
              className="px-6 py-3 bg-neutral-800/60 text-neutral-300 border border-neutral-700 rounded-xl font-medium hover:bg-neutral-800 hover:text-white transition-all"
            >
              {secondaryLabel}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default EmptyState;
