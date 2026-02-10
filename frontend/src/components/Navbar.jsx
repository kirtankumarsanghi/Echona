import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const navigate = useNavigate();

  const inspirationalQuotes = [
    { text: "Your mental health matters", icon: "💚", gradient: "from-green-500 to-emerald-500" },
    { text: "Take time to understand yourself", icon: "🧠", gradient: "from-purple-500 to-pink-500" },
    { text: "Every emotion is valid", icon: "🌈", gradient: "from-cyan-500 to-blue-500" },
    { text: "Self-care isn't selfish", icon: "✨", gradient: "from-yellow-500 to-orange-500" },
    { text: "You're doing better than you think", icon: "🌟", gradient: "from-indigo-500 to-purple-500" }
  ];

  useEffect(() => {
    const token = localStorage.getItem("echona_token");
    setLoggedIn(!!token);

    // Rotate quotes every 5 seconds
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % inspirationalQuotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("echona_token");
    localStorage.removeItem("echona_user");
    setLoggedIn(false);
    navigate("/");
  };

  return (
    <>
      {/* Top Inspirational Banner */}
      <motion.div
        key={currentQuote}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`bg-gradient-to-r ${inspirationalQuotes[currentQuote].gradient} fixed top-0 left-0 w-full z-50 py-2 px-4`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xl"
          >
            {inspirationalQuotes[currentQuote].icon}
          </motion.span>
          <p className="text-white font-semibold text-sm md:text-base tracking-wide">
            {inspirationalQuotes[currentQuote].text}
          </p>
          <div className="flex gap-1">
            {inspirationalQuotes.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentQuote ? "bg-white w-4" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700 fixed top-10 left-0 w-full z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-blue-400 hover:text-blue-300 transition">
          <img src="/echona-logo.svg" alt="Echona" className="w-10 h-10" />
          ECHONA
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-gray-300 text-lg">
          <Link className="hover:text-white" to="/">Home</Link>
          <Link className="hover:text-white" to="/detect">Detect Mood</Link>
          <Link className="hover:text-white" to="/dashboard">Dashboard</Link>
          <Link className="hover:text-white" to="/music">Music</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300 text-3xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-gray-800 border-t border-gray-700 px-6 py-4 space-y-3 text-gray-300 text-lg"
          >
            <Link className="block hover:text-white" to="/" onClick={() => setOpen(false)}>Home</Link>
            <Link className="block hover:text-white" to="/detect" onClick={() => setOpen(false)}>Detect Mood</Link>
            <Link className="block hover:text-white" to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
            <Link className="block hover:text-white" to="/music" onClick={() => setOpen(false)}>Music</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    </>
  );
}

export default Navbar;
