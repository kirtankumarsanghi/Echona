import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 py-4 shadow-lg shadow-black/20"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-wide text-neutral-100 transition-colors block">
                ECHONA
              </span>
              <span className="text-[10px] text-neutral-500 tracking-wider uppercase">Mental Wellness</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/#features" className="text-neutral-400 hover:text-indigo-400 text-sm font-medium transition-colors">
              Features
            </Link>
            <Link to="/#how-it-works" className="text-neutral-400 hover:text-indigo-400 text-sm font-medium transition-colors">
              How it Works
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/auth"
              className="text-neutral-400 hover:text-indigo-400 text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-neutral-200 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-neutral-950 pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-center">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-neutral-100 font-medium">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-neutral-100 font-medium">How it Works</a>
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-indigo-400 font-medium">Sign In</Link>
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xl font-bold">Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
