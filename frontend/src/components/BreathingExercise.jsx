import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

function BreathingExercise() {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState("ready"); // ready, inhale, hold, exhale
  const [isActive, setIsActive] = useState(false);

  // 4-7-8 Breathing Technique (Standardized to 4-4-4 for simplicity in demo or customizable)
  // Let's use Box Breathing: In(4) - Hold(4) - Out(4) - Hold(4)
  const breathingCycle = {
    inhale: { duration: 4000, text: "Inhale", subtext: "Expand your lungs", color: "#60a5fa" }, // Blue-400
    hold: { duration: 4000, text: "Hold", subtext: "Keep it steady", color: "#c084fc" },   // Purple-400
    exhale: { duration: 4000, text: "Exhale", subtext: "Release tension", color: "#34d399" }, // Emerald-400
    holdEmpty: { duration: 2000, text: "Pause", subtext: "Stay empty", color: "#9ca3af" } // Gray-400
  };

  useEffect(() => {
    let timeout;
    if (isActive && phase !== "ready") {
      let nextPhase = "";
      let duration = 0;

      if (phase === "inhale") { nextPhase = "hold"; duration = breathingCycle.inhale.duration; }
      else if (phase === "hold") { nextPhase = "exhale"; duration = breathingCycle.hold.duration; }
      else if (phase === "exhale") { nextPhase = "inhale"; duration = breathingCycle.exhale.duration; } 
      
      timeout = setTimeout(() => {
        setPhase(nextPhase);
      }, duration);
    }
    return () => clearTimeout(timeout);
  }, [isActive, phase]);

  const startExercise = () => {
    setIsActive(true);
    setPhase("inhale");
  };

  const stopExercise = () => {
    setIsActive(false);
    setPhase("ready");
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 p-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl hover:bg-white/20 transition-all group"
        title="Breathing Exercise"
      >
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-2xl"
          >
            🫁
          </motion.div>
          {/* Tooltip */}
          <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
            Breathe
          </span>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => {
              setIsOpen(false);
              stopExercise();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg aspect-square flex flex-col items-center justify-center"
            >
              {phase === "ready" ? (
                <div className="text-center">
                  <h2 className="text-3xl font-light text-white mb-2">Box Breathing</h2>
                  <p className="text-gray-400 mb-8">Reduce stress and anxiety in minutes.</p>
                  <button
                    onClick={startExercise}
                    className="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
                  >
                    Start Session
                  </button>
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  {/* Outer Rings */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: phase === "inhale" ? [1, 2] : phase === "exhale" ? [2, 1] : 
                               phase === "hold" ? 2 : 1.5,
                        opacity: phase === "inhale" ? [0.1, 0] : phase === "exhale" ? [0, 0.1] : 0,
                      }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full border border-white/20"
                      style={{ width: "300px", height: "300px" }}
                    />
                  ))}

                  {/* Main Circle */}
                  <motion.div
                    animate={{
                      scale: phase === "inhale" ? [1, 1.5] : 
                             phase === "exhale" ? [1.5, 1] : 
                             phase === "hold" ? 1.5 : 1
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)]"
                  >
                    <div className="text-center">
                      <motion.div
                        key={phase}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold text-white tracking-widest uppercase"
                      >
                        {breathingCycle[phase]?.text}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/50 text-xs mt-1"
                      >
                        {breathingCycle[phase]?.subtext}
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Close Button */}
              <button
                 onClick={() => { setIsOpen(false); stopExercise(); }}
                 className="absolute top-0 right-0 p-4 text-white/50 hover:text-white transition"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default BreathingExercise;
