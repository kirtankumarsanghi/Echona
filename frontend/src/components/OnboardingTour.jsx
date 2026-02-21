import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMood } from "../context/MoodContext";

const STEPS = [
  {
    target: "welcome",
    title: "Welcome to ECHONA! 🎵",
    description: "Your AI-powered mental wellness companion. Let's take a quick tour to get you started.",
    position: "center",
  },
  {
    target: "mood-detect",
    title: "Step 1: Detect Your Mood",
    description: "Use face detection, voice analysis, text input, or manual selection to identify how you're feeling.",
    position: "center",
    icon: "🎭",
  },
  {
    target: "music",
    title: "Step 2: Get Music Therapy",
    description: "Based on your mood, ECHONA curates personalized music to uplift or match your emotional state.",
    position: "center",
    icon: "🎶",
  },
  {
    target: "dashboard",
    title: "Step 3: Track Progress",
    description: "Your Dashboard shows mood trends, insights, and history to help you understand your emotional patterns.",
    position: "center",
    icon: "📊",
  },
  {
    target: "features",
    title: "Bonus Features",
    description: "Explore breathing exercises, meditation timer, journal, music challenges, and a wellness planner!",
    position: "center",
    icon: "✨",
  },
];

function OnboardingTour() {
  const { onboardingDone, completeOnboarding } = useMood();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!onboardingDone) {
      // Small delay so the page renders first
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, [onboardingDone]);

  if (onboardingDone || !visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      completeOnboarding();
      setVisible(false);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            key={step}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="bg-neutral-900 border border-neutral-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
          >
            {/* Gradient top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

            {/* Step indicator */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step ? "w-8 bg-indigo-500" : i < step ? "w-4 bg-indigo-500/50" : "w-4 bg-neutral-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-neutral-500 text-xs font-mono">{step + 1}/{STEPS.length}</span>
            </div>

            {/* Icon */}
            {current.icon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-5xl mb-4 text-center"
              >
                {current.icon}
              </motion.div>
            )}

            {/* Content */}
            <h3 className="text-2xl font-bold text-neutral-100 mb-3 text-center">{current.title}</h3>
            <p className="text-neutral-400 text-center leading-relaxed mb-8">{current.description}</p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-neutral-500 hover:text-neutral-300 text-sm font-medium transition-colors"
              >
                Skip Tour
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
              >
                {isLast ? "Get Started" : "Next"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OnboardingTour;
