import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const MoodJournal = ({ mood, onSave }) => {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const saveNote = async () => {
    if (!note.trim()) return;
    
    setSaving(true);
    try {
      const response = await axiosInstance.post("/api/mood/add-note", {
        mood,
        note: note.trim(),
        score: Math.floor(Math.random() * 10) + 1,
      });
      
      console.log("[MoodJournal] Note saved:", response.data);
      alert("✅ Mood with note saved successfully!");
      
      if (onSave) {
        onSave();
      } else {
        // Navigate to music page after success
        setTimeout(() => navigate("/music"), 1000);
      }
      
      setNote("");
    } catch (err) {
      console.error("[MoodJournal] Error saving note:", err);
      alert("❌ Failed to save note: " + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📝</span>
        <h3 className="text-xl font-bold text-white">Add a Note</h3>
      </div>
      
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="How are you feeling? What made you feel this way? (Optional)"
        className="w-full h-32 p-4 rounded-xl bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none resize-none transition-colors"
        maxLength={500}
      />
      
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-400">{note.length}/500 characters</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveNote}
          disabled={!note.trim() || saving}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            note.trim() && !saving
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/50 text-white"
              : "bg-gray-600 cursor-not-allowed opacity-50 text-gray-300"
          }`}
        >
          {saving ? "Saving..." : "Save Note"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MoodJournal;
