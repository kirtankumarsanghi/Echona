import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

function BreathingExercise() {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState("ready"); // ready, inhale, hold, exhale
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const breathingCycle = {
    inhale: { duration: 4000, text: "Breathe In", color: "from-cyan-400 to-blue-500" },
    hold: { duration: 4000, text: "Hold", color: "from-purple-400 to-pink-500" },
    exhale: { duration: 4000, text: "Breathe Out", color: "from-green-400 to-emerald-500" }
  };

  useEffect(() => {
    let timer;
    if (isActive && phase !== "ready") {
      const currentPhase = breathingCycle[phase];
      timer = setInterval(() => {
        setCount(prev => {
          if (prev >= currentPhase.duration / 1000) {
            // Move to next phase
            if (phase === "inhale") setPhase("hold");
            else if (phase === "hold") setPhase("exhale");
            else if (phase === "exhale") {
              setCycles(prev => prev + 1);
              setPhase("inhale");
            }
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase]);

  const startExercise = () => {
    setIsActive(true);
    setPhase("inhale");
    setCount(0);
    setCycles(0);
  };

  const stopExercise = () => {
    setIsActive(false);
    setPhase("ready");
    setCount(0);
  };

  const getCircleScale = () => {
    if (phase === "inhale") return 1.5;
    if (phase === "hold") return 1.5;
    if (phase === "exhale") return 0.8;
    return 1;
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 p-4 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 text-white shadow-2xl hover:shadow-cyan-500/50 transition-all"
        title="Breathing Exercise"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-3xl"
        >
          🫁
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setIsOpen(false);
              stopExercise();
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 max-w-lg w-full border border-white/10 shadow-2xl"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="text-6xl mb-4 inline-block"
                >
                  🧘‍♀️
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Breathing Exercise</h2>
                <p className="text-gray-400 mb-6">
                  Follow the circle's rhythm to calm your mind
                </p>

                {/* Breathing Circle */}
                <div className="relative h-64 flex items-center justify-center mb-6">
                  <motion.div
                    animate={{ scale: getCircleScale() }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className={`w-48 h-48 rounded-full bg-gradient-to-br ${
                      phase !== "ready" ? breathingCycle[phase]?.color : "from-gray-600 to-gray-700"
                    } shadow-2xl flex items-center justify-center`}
                  >
                    <div className="text-center">
                      <p className="text-white text-2xl font-bold mb-2">
                        {phase === "ready" ? "Ready?" : breathingCycle[phase]?.text}
                      </p>
                      {isActive && phase !== "ready" && (
                        <p className="text-white/80 text-5xl font-bold">
                          {breathingCycle[phase].duration / 1000 - count}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Stats */}
                <div className="bg-white/5 rounded-xl p-4 mb-6">
                  <p className="text-gray-300 text-sm">
                    Completed Cycles: <span className="text-cyan-400 font-bold text-lg">{cycles}</span>
                  </p>
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                  {!isActive ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startExercise}
                      className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all"
                    >
                      ▶️ Start Exercise
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopExercise}
                      className="flex-1 py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-red-500/50 transition-all"
                    >
                      ⏸️ Stop
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsOpen(false);
                      stopExercise();
                    }}
                    className="py-4 px-6 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
                  >
                    ✕
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default BreathingExercise;
