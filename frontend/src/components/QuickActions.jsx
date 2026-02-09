import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { icon: "🎭", label: "Detect Mood", path: "/detect", color: "from-cyan-500 to-blue-500" },
    { icon: "📊", label: "Dashboard", path: "/dashboard", color: "from-purple-500 to-pink-500" },
    { icon: "🎵", label: "Music", path: "/music", color: "from-green-500 to-emerald-500" },
    { icon: "🏠", label: "Home", path: "/", color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="fixed bottom-24 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.path}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigate(action.path);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r ${action.color} text-white shadow-2xl hover:shadow-xl transition-all group`}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="font-semibold pr-2 whitespace-nowrap">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-2xl hover:shadow-pink-500/50 transition-all ${
          isOpen ? "rotate-45" : ""
        }`}
        title="Quick Actions"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-bold"
        >
          {isOpen ? "✕" : "⚡"}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default QuickActions;
