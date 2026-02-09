import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

function MeditationTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState(5); // minutes
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedSound, setSelectedSound] = useState("silence");

  const ambientSounds = [
    { id: "silence", name: "Silence", emoji: "🤫", color: "from-gray-500 to-gray-600" },
    { id: "rain", name: "Rain", emoji: "🌧️", color: "from-blue-500 to-cyan-500" },
    { id: "ocean", name: "Ocean Waves", emoji: "🌊", color: "from-teal-500 to-blue-500" },
    { id: "forest", name: "Forest", emoji: "🌲", color: "from-green-500 to-emerald-500" },
    { id: "birds", name: "Birds", emoji: "🐦", color: "from-yellow-500 to-green-500" },
    { id: "wind", name: "Wind Chimes", emoji: "🎐", color: "from-purple-500 to-pink-500" }
  ];

  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startMeditation = () => {
    setTimeLeft(duration * 60);
    setIsActive(true);
    setIsCompleted(false);
  };

  const pauseMeditation = () => {
    setIsActive(false);
  };

  const resumeMeditation = () => {
    setIsActive(true);
  };

  const resetMeditation = () => {
    setIsActive(false);
    setTimeLeft(0);
    setIsCompleted(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (duration === 0) return 0;
    return ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-24 z-40 p-4 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600 text-white shadow-2xl hover:shadow-purple-500/50 transition-all"
        title="Meditation Timer"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-3xl"
        >
          🧘
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => {
              setIsOpen(false);
              resetMeditation();
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
            >
              {!isCompleted ? (
                <>
                  <div className="text-center mb-6">
                    <motion.div
                      animate={{ 
                        scale: isActive ? [1, 1.1, 1] : 1,
                        rotate: isActive ? [0, 360] : 0
                      }}
                      transition={{ 
                        duration: isActive ? 4 : 0,
                        repeat: isActive ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                      className="text-7xl mb-4 inline-block"
                    >
                      🧘‍♀️
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white mb-2">Meditation Timer</h2>
                    <p className="text-gray-400">Find your inner peace</p>
                  </div>

                  {timeLeft === 0 ? (
                    <>
                      {/* Duration Selection */}
                      <div className="mb-6">
                        <label className="text-white font-semibold mb-3 block">
                          Duration: {duration} minutes
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="60"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1 min</span>
                          <span>30 min</span>
                          <span>60 min</span>
                        </div>
                      </div>

                      {/* Ambient Sound Selection */}
                      <div className="mb-6">
                        <label className="text-white font-semibold mb-3 block">
                          Ambient Sound
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {ambientSounds.map((sound) => (
                            <motion.button
                              key={sound.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedSound(sound.id)}
                              className={`p-3 rounded-xl ${
                                selectedSound === sound.id
                                  ? `bg-gradient-to-r ${sound.color}`
                                  : "bg-gray-700"
                              } transition-all`}
                            >
                              <div className="text-2xl mb-1">{sound.emoji}</div>
                              <div className="text-xs text-white">{sound.name}</div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startMeditation}
                        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-purple-500/50 transition-all"
                      >
                        🎯 Start Meditation
                      </motion.button>
                    </>
                  ) : (
                    <>
                      {/* Timer Display */}
                      <div className="relative mb-8">
                        <svg className="w-full h-64" viewBox="0 0 200 200">
                          <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke="#374151"
                            strokeWidth="8"
                          />
                          <motion.circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={565.48}
                            strokeDashoffset={565.48 - (565.48 * getProgress()) / 100}
                            transform="rotate(-90 100 100)"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#a855f7" />
                              <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-6xl font-bold text-white mb-2">
                              {formatTime(timeLeft)}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {ambientSounds.find(s => s.id === selectedSound)?.emoji} {ambientSounds.find(s => s.id === selectedSound)?.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex gap-3">
                        {isActive ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={pauseMeditation}
                            className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg"
                          >
                            ⏸️ Pause
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resumeMeditation}
                            className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg"
                          >
                            ▶️ Resume
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={resetMeditation}
                          className="flex-1 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg"
                        >
                          🔄 Reset
                        </motion.button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 1], rotate: [0, 360, 0] }}
                    transition={{ duration: 1 }}
                    className="text-8xl mb-6"
                  >
                    🎉
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Well Done!
                  </h2>
                  <p className="text-gray-300 mb-6">
                    You completed {duration} minutes of meditation. Your mind thanks you! 🙏
                  </p>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetMeditation}
                      className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold"
                    >
                      🔄 New Session
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsOpen(false);
                        resetMeditation();
                      }}
                      className="py-4 px-6 bg-gray-700 text-white rounded-xl font-semibold"
                    >
                      ✕ Close
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MeditationTimer;
