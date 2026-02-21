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
    { id: "silence", name: "Silence", emoji: "🤫", bg: "bg-gray-800" },
    { id: "rain", name: "Rain", emoji: "🌧️", bg: "bg-blue-900" },
    { id: "ocean", name: "Waves", emoji: "🌊", bg: "bg-cyan-900" },
    { id: "forest", name: "Nature", emoji: "🌲", bg: "bg-emerald-900" },
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

  // Calculate STROKE DASHARRAY for Progress Circle
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = duration > 0 ? ((duration * 60 - timeLeft) / (duration * 60)) : 0;
  const dashoffset = circumference - (1 - progress) * circumference;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-20 z-40 p-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl hover:bg-white/20 transition-all group"
        title="Meditation Timer"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="text-2xl"
          >
            🧘
          </motion.div>
          {/* Tooltip */}
          <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
            Meditate
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
              resetMeditation();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#12121a] rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl overflow-hidden relative"
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-500/20 blur-[60px]" />

              {!isActive && !isCompleted ? (
                // SETUP SCREEN
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-center text-white mb-8">Focus Session</h2>
                  
                  {/* Duration Selector */}
                  <div className="mb-8">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">Duration (min)</p>
                    <div className="flex justify-between bg-white/5 rounded-xl p-1">
                      {[3, 5, 10, 15].map(m => (
                        <button
                          key={m}
                          onClick={() => setDuration(m)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            duration === m ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sound Selector */}
                  <div className="mb-8">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">Soundscape</p>
                    <div className="grid grid-cols-4 gap-2">
                        {ambientSounds.map(sound => (
                          <button
                            key={sound.id}
                            onClick={() => setSelectedSound(sound.id)}
                            className={`flex flex-col items-center justify-center py-3 rounded-xl border border-transparent transition-all ${
                              selectedSound === sound.id 
                                ? 'bg-white/10 border-indigo-500 ring-1 ring-indigo-500' 
                                : 'bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <span className="text-xl mb-1">{sound.emoji}</span>
                            <span className="text-[10px] text-gray-400">{sound.name}</span>
                          </button>
                        ))}
                    </div>
                  </div>

                  <button
                    onClick={startMeditation}
                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-transform"
                  >
                    Start Meditation
                  </button>
                </div>
              ) : !isCompleted ? (
                // TIMER SCREEN
                <div className="flex flex-col items-center justify-center py-8 relative z-10">
                  <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                    {/* SVG Circle Timer */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="128"
                        cy="128"
                        r={radius}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <motion.circle
                        cx="128"
                        cy="128"
                        r={radius}
                        stroke="#818cf8"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: dashoffset }}
                        transition={{ duration: 1, ease: "linear" }}
                      />
                    </svg>
                    
                    <div className="text-center">
                      <div className="text-5xl font-mono font-light text-white mb-2 tracking-wider">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-xs text-indigo-400 uppercase tracking-widest font-bold">
                        Focusing
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={resetMeditation}
                    className="px-6 py-2 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all text-sm"
                  >
                    End Session
                  </button>
                </div>
              ) : (
                // SUCCESS SCREEN
                <div className="text-center py-8 relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
                  >
                    <span className="text-4xl">✨</span>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Session Complete</h3>
                  <p className="text-gray-400 mb-8">You've invested {duration} minutes in yourself.</p>
                  <button
                    onClick={resetMeditation}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-white transition"
                  >
                    Close
                  </button>
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
