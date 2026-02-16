import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OptionsMenu = ({ currentPage = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    { 
      label: "Home", 
      path: "/", 
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      label: "Dashboard", 
      path: "/dashboard", 
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      label: "Mood Detection", 
      path: "/mood-detect", 
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      label: "Music Therapy", 
      path: "/music", 
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      )
    },
    { 
      label: "Todo Planner", 
      path: "/todo-planner", 
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
  ];

  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleClearData = () => {
    try {
      const history = localStorage.getItem('echona_mood_history');
      const count = history ? JSON.parse(history).length : 0;
      
      localStorage.removeItem('echona_mood_history');
      localStorage.removeItem('detected_mood');
      
      setShowClearModal(false);
      setIsOpen(false);
      
      alert(`✅ Cleared ${count} mood entries! Your dashboard has been reset.`);
      
      // Refresh if on dashboard
      if (currentPage === '/dashboard') {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error clearing data:', err);
      alert('❌ Failed to clear data. Please try again.');
    }
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center w-10 h-10 
          rounded-full border-2 
          backdrop-blur-sm
          transition-all duration-300
          ${isOpen 
            ? 'bg-neutral-800 border-violet-500/60 shadow-lg shadow-violet-500/20' 
            : 'bg-neutral-900/80 border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/90'
          }
        `}
        aria-label="Options Menu"
      >
        <div className="flex flex-col items-center justify-center gap-1">
          <motion.div 
            animate={{ scale: isOpen ? 0.8 : 1 }}
            className="w-1 h-1 rounded-full bg-neutral-300"
          />
          <motion.div 
            animate={{ scale: isOpen ? 0.8 : 1 }}
            className="w-1 h-1 rounded-full bg-neutral-300"
          />
          <motion.div 
            animate={{ scale: isOpen ? 0.8 : 1 }}
            className="w-1 h-1 rounded-full bg-neutral-300"
          />
        </div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="py-2">
              {menuItems.map((item, index) => {
                const isActive = currentPage === item.path;
                return (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full px-4 py-3 flex items-center gap-3
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-violet-300 border-l-2 border-violet-500' 
                        : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-neutral-100'
                      }
                    `}
                  >
                    <div className={`${isActive ? 'text-violet-400' : 'text-neutral-400'}`}>
                      {item.icon}
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-800" />

            {/* Clear Data Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              onClick={() => {
                setIsOpen(false);
                setShowClearModal(true);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-orange-400 hover:bg-orange-500/10 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="font-medium text-sm">Clear Mood Data</span>
            </motion.button>

            {/* Divider */}
            <div className="border-t border-neutral-800" />

            {/* Logout Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => {
                localStorage.clear();
                navigate('/');
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium text-sm">Logout</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Data Confirmation Modal */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowClearModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Clear All Mood Data?</h3>
                <p className="text-gray-400">
                  This will permanently delete all your mood history and reset your dashboard. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClearData}
                  className="flex-1 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
                >
                  Clear Data
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OptionsMenu;
