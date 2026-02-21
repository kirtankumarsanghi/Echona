import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

/**
 * Session timeout warning banner (#27)
 * Shows when JWT expires in < 5 minutes
 */
function SessionWarning() {
  const { sessionWarning, dismissSessionWarning, logout } = useAuth();

  return (
    <AnimatePresence>
      {sessionWarning && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[90] bg-amber-600/95 backdrop-blur-sm text-white px-4 py-3 shadow-lg"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">
                Your session will expire soon. Please save your work.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { logout(); window.location.href = "/auth"; }}
                className="px-3 py-1 text-xs font-bold bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Sign in again
              </button>
              <button
                onClick={dismissSessionWarning}
                className="px-2 py-1 text-white/70 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SessionWarning;
