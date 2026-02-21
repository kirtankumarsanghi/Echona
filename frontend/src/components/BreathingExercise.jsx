import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

function BreathingExercise({ inline = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState("ready");
  const [isActive, setIsActive] = useState(false);

  const breathingCycle = {
    inhale: { duration: 4000, text: "Inhale", subtext: "Expand your lungs", color: "text-blue-400" },
    hold: { duration: 4000, text: "Hold", subtext: "Keep it steady", color: "text-purple-400" },
    exhale: { duration: 4000, text: "Exhale", subtext: "Release tension", color: "text-emerald-400" },
  };

  useEffect(() => {
    let timeout;
    if (isActive && phase !== "ready") {
      let nextPhase = "";
      let duration = 0;

      if (phase === "inhale") { nextPhase = "hold"; duration = breathingCycle.inhale.duration; }
      else if (phase === "hold") { nextPhase = "exhale"; duration = breathingCycle.hold.duration; }
      else if (phase === "exhale") { nextPhase = "inhale"; duration = breathingCycle.exhale.duration; }

      timeout = setTimeout(() => setPhase(nextPhase), duration);
    }
    return () => clearTimeout(timeout);
  }, [isActive, phase]);

  const startExercise = () => { setIsActive(true); setPhase("inhale"); };
  const stopExercise = () => { setIsActive(false); setPhase("ready"); };

  // ─── Inline card mode (for wellness section) ──────────────
  if (inline) {
    return (
      <>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsOpen(true)}
          className="w-full bg-neutral-800/40 hover:bg-neutral-800/60 border border-neutral-800/60 rounded-xl p-4 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-lg"
              >
                🫁
              </motion.span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors">
                Box Breathing
              </h4>
              <p className="text-[11px] text-neutral-500">4-4-4 technique · Reduces anxiety</p>
            </div>
            <svg className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.button>

        {/* Full-screen modal (same for both modes) */}
        <AnimatePresence>
          {isOpen && <BreathingModal phase={phase} isActive={isActive} breathingCycle={breathingCycle} startExercise={startExercise} stopExercise={stopExercise} onClose={() => { setIsOpen(false); stopExercise(); }} />}
        </AnimatePresence>
      </>
    );
  }

  // ─── Floating button mode (legacy/default) ──────────────
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 p-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl hover:bg-white/20 transition-all group"
        title="Breathing Exercise"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-2xl"
        >
          🫁
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && <BreathingModal phase={phase} isActive={isActive} breathingCycle={breathingCycle} startExercise={startExercise} stopExercise={stopExercise} onClose={() => { setIsOpen(false); stopExercise(); }} />}
      </AnimatePresence>
    </>
  );
}

/* ─── Shared Modal ──────────────────────────────────────── */
function BreathingModal({ phase, isActive, breathingCycle, startExercise, stopExercise, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4"
      onClick={onClose}
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
            <h2 className="text-2xl font-light text-white mb-2">Box Breathing</h2>
            <p className="text-neutral-500 text-sm mb-8">Reduce stress in just a few breaths.</p>
            <button
              onClick={startExercise}
              className="px-8 py-3 bg-white text-neutral-900 rounded-full font-semibold hover:scale-105 transition-transform text-sm"
            >
              Start Session
            </button>
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            {/* Outer pulse rings */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: phase === "inhale" ? [1, 1.8] : phase === "exhale" ? [1.8, 1] : phase === "hold" ? 1.8 : 1.4,
                  opacity: phase === "inhale" ? [0.08, 0] : phase === "exhale" ? [0, 0.08] : 0,
                }}
                transition={{ duration: 4, ease: "easeInOut", delay: i * 0.3 }}
                className="absolute rounded-full border border-white/10"
                style={{ width: "280px", height: "280px" }}
              />
            ))}

            {/* Main circle */}
            <motion.div
              animate={{
                scale: phase === "inhale" ? [1, 1.4] : phase === "exhale" ? [1.4, 1] : phase === "hold" ? 1.4 : 1
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="w-44 h-44 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xl font-semibold tracking-widest uppercase ${breathingCycle[phase]?.color || "text-white"}`}
                >
                  {breathingCycle[phase]?.text}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/40 text-[11px] mt-1"
                >
                  {breathingCycle[phase]?.subtext}
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-4 text-neutral-600 hover:text-white transition text-sm"
        >
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
}

export default BreathingExercise;
