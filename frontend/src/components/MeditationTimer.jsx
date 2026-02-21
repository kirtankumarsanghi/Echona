import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

function MeditationTimer({ inline = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedSound, setSelectedSound] = useState("silence");

  const ambientSounds = [
    { id: "silence", name: "Silence", emoji: "🤫" },
    { id: "rain", name: "Rain", emoji: "🌧️" },
    { id: "ocean", name: "Waves", emoji: "🌊" },
    { id: "forest", name: "Nature", emoji: "🌲" },
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

  const startMeditation = () => { setTimeLeft(duration * 60); setIsActive(true); setIsCompleted(false); };
  const resetMeditation = () => { setIsActive(false); setTimeLeft(0); setIsCompleted(false); };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = duration > 0 ? ((duration * 60 - timeLeft) / (duration * 60)) : 0;
  const dashoffset = circumference - (1 - progress) * circumference;

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
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <motion.span
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="text-lg"
              >
                🧘
              </motion.span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors">
                Meditation Timer
              </h4>
              <p className="text-[11px] text-neutral-500">3-15 min sessions · Ambient sounds</p>
            </div>
            <svg className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <MeditationModal
              duration={duration} setDuration={setDuration}
              timeLeft={timeLeft} isActive={isActive} isCompleted={isCompleted}
              selectedSound={selectedSound} setSelectedSound={setSelectedSound}
              ambientSounds={ambientSounds}
              startMeditation={startMeditation} resetMeditation={resetMeditation}
              formatTime={formatTime}
              radius={radius} circumference={circumference} dashoffset={dashoffset}
              onClose={() => { setIsOpen(false); resetMeditation(); }}
            />
          )}
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
        className="fixed bottom-6 left-20 z-40 p-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl hover:bg-white/20 transition-all group"
        title="Meditation Timer"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="text-2xl"
        >
          🧘
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <MeditationModal
            duration={duration} setDuration={setDuration}
            timeLeft={timeLeft} isActive={isActive} isCompleted={isCompleted}
            selectedSound={selectedSound} setSelectedSound={setSelectedSound}
            ambientSounds={ambientSounds}
            startMeditation={startMeditation} resetMeditation={resetMeditation}
            formatTime={formatTime}
            radius={radius} circumference={circumference} dashoffset={dashoffset}
            onClose={() => { setIsOpen(false); resetMeditation(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Shared Modal ──────────────────────────────────────── */
function MeditationModal({
  duration, setDuration, timeLeft, isActive, isCompleted,
  selectedSound, setSelectedSound, ambientSounds,
  startMeditation, resetMeditation, formatTime,
  radius, circumference, dashoffset, onClose
}) {
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
        className="bg-neutral-900 rounded-2xl p-7 max-w-md w-full border border-neutral-800 shadow-2xl overflow-hidden relative"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-indigo-500/10 blur-[50px] pointer-events-none" />

        {!isActive && !isCompleted ? (
          /* SETUP SCREEN */
          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-center text-neutral-100 mb-6">Focus Session</h2>

            {/* Duration */}
            <div className="mb-6">
              <p className="text-[10px] text-neutral-500 uppercase font-semibold tracking-widest mb-2.5">Duration (min)</p>
              <div className="flex bg-neutral-800/50 rounded-xl p-1 gap-1">
                {[3, 5, 10, 15].map(m => (
                  <button
                    key={m}
                    onClick={() => setDuration(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      duration === m ? 'bg-white text-neutral-900 shadow' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Soundscape */}
            <div className="mb-6">
              <p className="text-[10px] text-neutral-500 uppercase font-semibold tracking-widest mb-2.5">Soundscape</p>
              <div className="grid grid-cols-4 gap-2">
                {ambientSounds.map(sound => (
                  <button
                    key={sound.id}
                    onClick={() => setSelectedSound(sound.id)}
                    className={`flex flex-col items-center py-2.5 rounded-xl border transition-all ${
                      selectedSound === sound.id
                        ? 'bg-neutral-800/60 border-indigo-500/50 ring-1 ring-indigo-500/30'
                        : 'bg-neutral-800/30 border-neutral-800/50 hover:bg-neutral-800/50'
                    }`}
                  >
                    <span className="text-lg mb-0.5">{sound.emoji}</span>
                    <span className="text-[10px] text-neutral-500">{sound.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startMeditation}
              className="w-full py-3.5 bg-white text-neutral-900 rounded-xl font-semibold text-sm hover:shadow-md transition-all"
            >
              Start Meditation
            </button>
          </div>
        ) : !isCompleted ? (
          /* TIMER SCREEN */
          <div className="flex flex-col items-center justify-center py-6 relative z-10">
            <div className="relative w-56 h-56 mb-6 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="112" cy="112" r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
                <motion.circle
                  cx="112" cy="112" r={radius}
                  stroke="#818cf8"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashoffset }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </svg>
              <div className="text-center">
                <div className="text-4xl font-mono font-light text-neutral-100 mb-1 tracking-wider">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-[10px] text-indigo-400/80 uppercase tracking-widest font-semibold">
                  Focusing
                </div>
              </div>
            </div>
            <button
              onClick={() => { resetMeditation(); onClose(); }}
              className="px-5 py-2 rounded-full border border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 transition-all text-xs font-medium"
            >
              End Session
            </button>
          </div>
        ) : (
          /* SUCCESS SCREEN */
          <div className="text-center py-6 relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-5"
            >
              <span className="text-2xl">✨</span>
            </motion.div>
            <h3 className="text-lg font-semibold text-neutral-100 mb-1">Session Complete</h3>
            <p className="text-neutral-500 text-sm mb-6">You invested {duration} minutes in yourself.</p>
            <button
              onClick={() => { resetMeditation(); onClose(); }}
              className="w-full py-3 bg-neutral-800/60 hover:bg-neutral-800 rounded-xl font-medium text-neutral-300 transition text-sm"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default MeditationTimer;
