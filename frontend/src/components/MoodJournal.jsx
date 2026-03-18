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
      alert("Mood note saved successfully.");
      
      if (onSave) {
        onSave();
      } else {
        // Navigate to music page after success
        setTimeout(() => navigate("/music"), 1000);
      }
      
      setNote("");
    } catch (err) {
      console.error("[MoodJournal] Error saving note:", err);
      alert("Failed to save note: " + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-soft"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-semibold text-primary-300">NT</span>
        <h3 className="text-xl font-bold text-slate-100">Add a Note</h3>
      </div>
      
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Describe how you are feeling and what contributed to it (optional)."
        className="w-full h-32 p-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none transition-colors"
        maxLength={500}
      />
      
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-slate-400">{note.length}/500 characters</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveNote}
          disabled={!note.trim() || saving}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            note.trim() && !saving
              ? "bg-primary-700 hover:bg-primary-800 text-white"
              : "bg-slate-300 cursor-not-allowed opacity-70 text-slate-500"
          }`}
        >
          {saving ? "Saving..." : "Save Note"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MoodJournal;
