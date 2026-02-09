import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("echona_theme") || "dark";
    setIsDark(savedTheme === "dark");
    document.documentElement.classList.toggle("light-mode", savedTheme === "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("echona_theme", newTheme);
    document.documentElement.classList.toggle("light-mode", newTheme === "light");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        className={`relative p-4 rounded-2xl shadow-2xl transition-all duration-300 ${
          isDark
            ? "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 hover:shadow-purple-500/50"
            : "bg-gradient-to-br from-orange-400 via-yellow-400 to-amber-500 hover:shadow-yellow-500/50"
        }`}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {/* Animated Icon Container */}
        <motion.div
          className="relative w-8 h-8 flex items-center justify-center"
          initial={false}
          animate={{
            rotate: isDark ? 0 : 180,
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
          }}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.span
                key="moon"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.4 }}
                className="text-3xl absolute"
              >
                🌙
              </motion.span>
            ) : (
              <motion.span
                key="sun"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.4 }}
                className="text-3xl absolute"
              >
                ☀️
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Glow Effect */}
        <motion.div
          className={`absolute inset-0 rounded-2xl blur-xl ${
            isDark
              ? "bg-gradient-to-br from-indigo-600 to-purple-600"
              : "bg-gradient-to-br from-orange-400 to-yellow-400"
          }`}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ zIndex: -1 }}
        />
      </motion.button>

      {/* Enhanced Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-20 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap pointer-events-none ${
              isDark
                ? "bg-white text-gray-900 shadow-lg"
                : "bg-gray-900 text-white shadow-lg"
            }`}
          >
            <span>Switch to {isDark ? "Light" : "Dark"} Mode</span>
            
            {/* Arrow */}
            <div
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 ${
                isDark ? "bg-white" : "bg-gray-900"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;
