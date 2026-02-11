import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleHelp = () => {
    if (window.resetEchonaGuide) {
      window.resetEchonaGuide();
      setIsOpen(false);
    }
  };

  const actions = [
    { icon: "❓", label: "Help", onClick: handleHelp, color: "from-amber-500 to-orange-500", isSpecial: true },
    { icon: "🎭", label: "Mood", path: "/mood-detect", color: "from-cyan-500 to-blue-500" },
    { icon: "📊", label: "Stats", path: "/dashboard", color: "from-purple-500 to-pink-500" },
    { icon: "🎵", label: "Music", path: "/music", color: "from-fuchsia-500 to-rose-500" },
    { icon: "🏠", label: "Home", path: "/", color: "from-blue-600 to-indigo-600" },
  ];

  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 space-y-3 pointer-events-auto"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, x: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (action.isSpecial) {
                    action.onClick();
                  } else {
                    navigate(action.path);
                    setIsOpen(false);
                  }
                }}
                className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-white/20 transition-all group w-full justify-end"
              >
                <span className="font-medium text-sm pr-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300 absolute right-12">
                  {action.label}
                </span>
                <span className="font-medium text-sm pr-2 whitespace-nowrap group-hover:opacity-0 transition-opacity">
                  {action.label}
                </span>
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center text-sm shadow-md`}>
                  {action.icon}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto relative p-4 rounded-full shadow-2xl transition-all duration-300 border border-white/20 ${
          isOpen ? "bg-white text-black" : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
        }`}
        title="Menu"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xl"
        >
          {isOpen ? "✕" : "•••"}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default QuickActions;
