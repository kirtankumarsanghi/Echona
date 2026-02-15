import { motion } from "framer-motion";
import { useState } from "react";
import JournalModal from "./JournalModal";

// Define features with actions
const smartFeatures = {
  Happy: {
    title: "Share Your Joy!",
    description: "Capture this happy moment with a selfie or share what's making you smile.",
    buttonText: "Share Moment",
    action: () => alert("Sharing to social media! (Not really, this is a demo)"),
  },
  Sad: {
    title: "A Moment for Reflection",
    description: "Watch a comforting video to find some relief.",
    buttonText: "Watch Comforting Video",
    action: () => window.open("https://www.youtube.com/watch?v=ZXsQAXx_ao0", "_blank"), // Peaceful nature & music
  },
  Angry: {
    title: "Release and Refocus",
    description: "Channel your anger by writing down what's on your mind in a digital journal.",
    buttonText: "Open Journal",
    action: "journal", // Changed to string identifier
  },
  Anxious: {
    title: "Find Your Calm",
    description: "Follow this guided breathing exercise to reduce anxiety.",
    buttonText: "Start Breathing Exercise",
    action: () => window.open("https://www.youtube.com/watch?v=O-6f5wQXSu8", "_blank"), // 5-min breathing
  },
  Calm: {
    title: "Embrace Tranquility",
    description: "Take a moment for gratitude journaling or enjoy some ambient visuals.",
    buttonText: "Start Journaling",
    action: "journal", // Changed to string identifier
  },
  Excited: {
    title: "Capture the Excitement!",
    description: "Your energy is contagious! Share this moment with friends.",
    buttonText: "Share Excitement",
    action: () => alert("Sharing with friends! (Not really, this is a demo)"),
  },
};

// Breathing exercise component
function BreathingExercise({ onStop }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full text-center p-8"
      >
        <h2 className="text-3xl font-bold text-blue-400 mb-4">Guided Breathing</h2>
        <p className="text-gray-300 mb-6">Inhale slowly... and exhale slowly.</p>
        <div className="relative w-40 h-40 mx-auto">
          <motion.div
            className="absolute inset-0 bg-blue-500 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
            Breathe
          </div>
        </div>
        <button
          onClick={onStop}
          className="mt-8 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors"
        >
          End Exercise
        </button>
      </motion.div>
    </div>
  );
}

function SmartMoodFeature({ mood }) {
  const [isBreathing, setIsBreathing] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const feature = smartFeatures[mood] || smartFeatures.Happy;

  const handleAction = () => {
    if (mood === "Anxious") {
      setIsBreathing(true);
    } else if (feature.action === "journal") {
      setIsJournalOpen(true);
    } else if (typeof feature.action === "function") {
      feature.action();
    } else {
      // For other moods that might have string actions
      if (mood === "Happy" || mood === "Excited") {
        alert("Sharing feature coming soon!");
      }
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 p-6 rounded-2xl shadow-xl mt-10 max-w-4xl mx-auto text-center"
      >
        <h3 className="text-2xl font-bold text-blue-400 mb-3">{feature.title}</h3>
        <p className="text-gray-300 mb-4">{feature.description}</p>
        <button
          onClick={handleAction}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-colors"
        >
          {feature.buttonText}
        </button>
      </motion.div>

      {isBreathing && <BreathingExercise onStop={() => setIsBreathing(false)} />}
      {isJournalOpen && <JournalModal isOpen={isJournalOpen} onClose={() => setIsJournalOpen(false)} mood={mood} />}
    </>
  );
}

export default SmartMoodFeature;
