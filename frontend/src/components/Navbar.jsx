import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

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
            ? "bg-slate-950/95 backdrop-blur-md border-b border-slate-800 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo size="default" className="scale-[0.92] sm:scale-100 origin-left" />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/#features" className="text-slate-300 hover:text-primary-300 text-sm font-medium transition-colors">
              Features
            </Link>
            <Link to="/#product-flow" className="text-slate-300 hover:text-primary-300 text-sm font-medium transition-colors">
              Product Flow
            </Link>
            <Link to="/#how-it-works" className="text-slate-300 hover:text-primary-300 text-sm font-medium transition-colors">
              How it Works
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle compact />
            <Link
              to="/auth"
              className="text-slate-300 hover:text-primary-300 text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              className="btn-primary px-5 py-2.5 text-sm"
            >
              Start Check-In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle compact />
            <button
              className="text-slate-200 p-2 rounded-lg hover:bg-slate-800/80"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              title={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-slate-950 pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-center">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-slate-100 font-medium">Features</a>
              <a href="#product-flow" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-slate-100 font-medium">Product Flow</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-slate-100 font-medium">How it Works</a>
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-slate-100 font-medium">Sign In</Link>
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="btn-primary px-6 py-4 text-xl font-semibold">Start Check-In</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
