import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const JournalModal = ({ isOpen, onClose, mood = "Angry" }) => {
  const [entry, setEntry] = useState("");
  const [savedEntries, setSavedEntries] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load saved entries
  useEffect(() => {
    const saved = localStorage.getItem("echona_journal_entries");
    if (saved) {
      try {
        setSavedEntries(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to load journal entries:", err);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!entry.trim()) return;

    const newEntry = {
      id: Date.now(),
      content: entry,
      mood: mood,
      date: new Date().toISOString(),
      dateFormatted: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updated = [newEntry, ...savedEntries];
    setSavedEntries(updated);
    localStorage.setItem("echona_journal_entries", JSON.stringify(updated));

    setEntry("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleDelete = (id) => {
    const updated = savedEntries.filter((e) => e.id !== id);
    setSavedEntries(updated);
    localStorage.setItem("echona_journal_entries", JSON.stringify(updated));
  };

  const getMoodColor = (entryMood) => {
    const colors = {
      Happy: "from-amber-500 to-yellow-500",
      Sad: "from-blue-500 to-cyan-500",
      Angry: "from-rose-500 to-red-600",
      Calm: "from-teal-500 to-emerald-500",
      Excited: "from-orange-500 to-rose-500",
      Anxious: "from-purple-500 to-pink-500",
    };
    return colors[entryMood] || "from-neutral-500 to-neutral-600";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Digital Journal</h2>
              <p className="text-white/80 text-sm">Write down your thoughts and feelings</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition text-white font-bold text-2xl"
            >
              ×
            </motion.button>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10"
              >
                <div className="bg-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-lg">
                  ✓ Entry Saved
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Write Section */}
            <div>
              <label className="block text-neutral-200 font-semibold mb-2 text-sm">
                What's on your mind?
              </label>
              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Express yourself freely... no judgment here."
                className="w-full h-40 bg-neutral-800/60 border border-neutral-700 rounded-xl p-4 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-neutral-500 text-sm">
                  {entry.length} characters
                </span>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEntry("")}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-neutral-300 rounded-lg font-medium transition-all"
                  >
                    Clear
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={!entry.trim()}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${
                      entry.trim()
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg"
                        : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                    }`}
                  >
                    Save Entry
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Divider */}
            {savedEntries.length > 0 && (
              <div className="border-t border-neutral-800 my-6" />
            )}

            {/* Previous Entries */}
            {savedEntries.length > 0 && (
              <div>
                <h3 className="text-neutral-200 font-bold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Previous Entries ({savedEntries.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {savedEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-4 group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full bg-gradient-to-r ${getMoodColor(
                              entry.mood
                            )}`}
                          />
                          <span className="text-neutral-400 text-xs">
                            {entry.dateFormatted}
                          </span>
                          <span className="text-neutral-500 text-xs px-2 py-0.5 bg-neutral-700/60 rounded">
                            {entry.mood}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(entry.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </div>
                      <p className="text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap">
                        {entry.content}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {savedEntries.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="text-neutral-500">No previous entries yet</p>
                <p className="text-neutral-600 text-sm mt-1">Start writing to save your thoughts</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JournalModal;
