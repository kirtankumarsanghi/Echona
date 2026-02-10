import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

function UserGuide() {
  const [showGuide, setShowGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has seen the guide before
    const hasSeenGuide = localStorage.getItem("echona_seen_guide");
    if (!hasSeenGuide) {
      setShowGuide(true);
    }
  }, []);

  const steps = [
    {
      title: "Welcome to ECHONA",
      description: "Your personal emotional AI companion. Let me show you around in just 3 steps!",
      icon: "START",
      color: "from-amber-500 to-orange-500"
    },
    {
      title: "Step 1: Detect Your Mood",
      description: "Click 'Detect Mood' in the menu to analyze your emotions using camera, voice, text, or simply pick your mood manually.",
      action: () => navigate("/mood-detect"),
      actionText: "Go to Mood Detection",
      icon: "STEP 01",
      color: "from-teal-500 to-emerald-500"
    },
    {
      title: "Step 2: Get Personalized Music",
      description: "After detecting your mood, we'll recommend music that matches your emotions perfectly. Discover songs that resonate with you!",
      action: () => navigate("/music"),
      actionText: "Browse Music",
      icon: "STEP 02",
      color: "from-orange-500 to-rose-500"
    },
    {
      title: "Step 3: Track Your Progress",
      description: "Visit your Dashboard to see mood trends, statistics, and insights about your emotional journey over time.",
      action: () => navigate("/dashboard"),
      actionText: "View Dashboard",
      icon: "STEP 03",
      color: "from-rose-500 to-pink-500"
    },
    {
      title: "You're All Set",
      description: "Use the navigation menu at the top to move between pages anytime. Start your emotional wellness journey now!",
      icon: "READY",
      color: "from-amber-500 to-yellow-500"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeGuide();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeGuide = () => {
    localStorage.setItem("echona_seen_guide", "true");
    setShowGuide(false);
  };

  const resetGuide = () => {
    localStorage.removeItem("echona_seen_guide");
    setCurrentStep(0);
    setShowGuide(true);
  };

  // Export reset function for use in other components
  window.resetEchonaGuide = resetGuide;

  return (
    <>
      {/* Help Button - Always visible */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={resetGuide}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full shadow-lg flex items-center justify-center text-white font-black text-sm hover:shadow-2xl transition-shadow"
        title="Show User Guide"
      >
        HELP
      </motion.button>

      {/* Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={closeGuide}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/20 rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={closeGuide}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl"
              >
                ×
              </button>

              {/* Step Indicator */}
              <div className="flex justify-center gap-2 mb-8">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? "w-8 bg-gradient-to-r from-amber-400 to-orange-400"
                        : index < currentStep
                        ? "w-2 bg-emerald-400"
                        : "w-2 bg-gray-600"
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className={`text-2xl font-black tracking-widest mb-6 bg-gradient-to-r ${steps[currentStep].color} bg-clip-text text-transparent`}
                >
                  {steps[currentStep].icon}
                </motion.div>

                <h2 className={`text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r ${steps[currentStep].color} bg-clip-text text-transparent`}>
                  {steps[currentStep].title}
                </h2>

                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  {steps[currentStep].description}
                </p>

                {/* Action Button */}
                {steps[currentStep].action && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      steps[currentStep].action();
                      closeGuide();
                    }}
                    className={`mb-6 px-8 py-4 bg-gradient-to-r ${steps[currentStep].color} rounded-full font-bold text-white shadow-lg hover:shadow-xl transition-all`}
                  >
                    {steps[currentStep].actionText} →
                  </motion.button>
                )}
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    currentStep === 0
                      ? "opacity-50 cursor-not-allowed bg-gray-700"
                      : "bg-white/10 hover:bg-white/20 border border-white/20"
                  }`}
                >
                  ← Previous
                </button>

                <span className="text-gray-400">
                  {currentStep + 1} / {steps.length}
                </span>

                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  {currentStep === steps.length - 1 ? "Get Started! 🚀" : "Next →"}
                </button>
              </div>

              {/* Skip Button */}
              <button
                onClick={closeGuide}
                className="mt-4 text-gray-500 hover:text-gray-300 text-sm w-full text-center"
              >
                Skip Guide
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default UserGuide;
