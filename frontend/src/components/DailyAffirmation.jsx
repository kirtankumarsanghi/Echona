import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

function DailyAffirmation() {
  const [affirmation, setAffirmation] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const affirmations = {
    confidence: [
      "I am capable of achieving anything I set my mind to.",
      "I trust myself and my decisions.",
      "I am worthy of success and happiness.",
      "My potential is limitless.",
      "I believe in my abilities and express my true self with ease."
    ],
    motivation: [
      "Every day is a fresh start filled with possibilities.",
      "I am making progress with every step I take.",
      "Challenges are opportunities for growth.",
      "I have the power to create positive change.",
      "My dedication and hard work will pay off."
    ],
    peace: [
      "I am calm, peaceful, and centered.",
      "I release all tension and embrace tranquility.",
      "Peace begins with me.",
      "I breathe in relaxation and breathe out stress.",
      "I am in harmony with myself and the world around me."
    ],
    gratitude: [
      "I am grateful for all the blessings in my life.",
      "Each day brings new reasons to be thankful.",
      "I appreciate the journey, not just the destination.",
      "Gratitude fills my heart and attracts more positivity.",
      "I am thankful for this moment right now."
    ],
    selfLove: [
      "I love and accept myself exactly as I am.",
      "I am enough, just as I am.",
      "I deserve all the good things life has to offer.",
      "I treat myself with kindness and compassion.",
      "I am proud of how far I've come."
    ],
    resilience: [
      "I am stronger than any challenge I face.",
      "Every setback is a setup for a comeback.",
      "I bounce back from difficulties with grace.",
      "My strength grows with every obstacle I overcome.",
      "I am resilient, brave, and unstoppable."
    ]
  };

  const getRandomAffirmation = () => {
    setIsLoading(true);
    const categories = Object.keys(affirmations);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryAffirmations = affirmations[randomCategory];
    const randomAffirmation = categoryAffirmations[Math.floor(Math.random() * categoryAffirmations.length)];
    
    setTimeout(() => {
      setCategory(randomCategory);
      setAffirmation(randomAffirmation);
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    getRandomAffirmation();
  }, []);

  const getCategoryEmoji = () => {
    const emojis = {
      confidence: "💪",
      motivation: "🚀",
      peace: "☮️",
      gratitude: "🙏",
      selfLove: "💖",
      resilience: "🛡️"
    };
    return emojis[category] || "✨";
  };

  const getCategoryColor = () => {
    const colors = {
      confidence: "from-purple-500 to-pink-500",
      motivation: "from-orange-500 to-red-500",
      peace: "from-green-500 to-teal-500",
      gratitude: "from-yellow-500 to-orange-500",
      selfLove: "from-pink-500 to-rose-500",
      resilience: "from-blue-500 to-indigo-500"
    };
    return colors[category] || "from-cyan-500 to-blue-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-3xl">✨</span>
          Daily Affirmation
        </h3>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={getRandomAffirmation}
          className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white shadow-lg hover:shadow-purple-500/50 transition-all"
          title="Get new affirmation"
        >
          <span className="text-xl">🔄</span>
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-6xl inline-block"
            >
              ✨
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key={affirmation}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`bg-gradient-to-r ${getCategoryColor()} rounded-xl p-6 mb-4 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/10" />
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl mb-3 text-center"
                >
                  {getCategoryEmoji()}
                </motion.div>
                <p className="text-white text-lg font-semibold text-center leading-relaxed italic">
                  "{affirmation}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="bg-white/5 px-4 py-2 rounded-lg">
                <p className="text-gray-400 text-xs uppercase tracking-wider">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigator.clipboard.writeText(affirmation);
                  alert("Affirmation copied to clipboard! 📋");
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-all"
              >
                📋 Copy
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default DailyAffirmation;
