import { motion } from "framer-motion";

function Logo({ size = "w-32 h-32" }) {
  return (
    <motion.svg
      className={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {/* Outer glow circle */}
      <motion.circle
        cx="100"
        cy="100"
        r="90"
        fill="url(#glow)"
        opacity="0.3"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main circular background */}
      <circle
        cx="100"
        cy="100"
        r="75"
        fill="url(#bgGradient)"
        opacity="0.9"
      />

      {/* Abstract brain/emotion waves - Left side */}
      <motion.path
        d="M 50 80 Q 40 90 50 100 Q 40 110 50 120"
        stroke="url(#waveGradient1)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Center flowing lines */}
      <motion.path
        d="M 70 70 Q 90 80 100 90 Q 110 80 130 70"
        stroke="url(#waveGradient2)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, delay: 0.2, ease: "easeInOut" }}
      />

      <motion.path
        d="M 70 100 Q 85 105 100 100 Q 115 105 130 100"
        stroke="url(#waveGradient3)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, delay: 0.4, ease: "easeInOut" }}
      />

      <motion.path
        d="M 70 130 Q 90 120 100 110 Q 110 120 130 130"
        stroke="url(#waveGradient1)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, delay: 0.6, ease: "easeInOut" }}
      />

      {/* Abstract brain/emotion waves - Right side */}
      <motion.path
        d="M 150 80 Q 160 90 150 100 Q 160 110 150 120"
        stroke="url(#waveGradient2)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, delay: 0.8, ease: "easeInOut" }}
      />

      {/* Central pulse circle */}
      <motion.circle
        cx="100"
        cy="100"
        r="12"
        fill="url(#pulseGradient)"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Inner decorative circles */}
      <circle cx="80" cy="85" r="4" fill="#fbbf24" opacity="0.6" />
      <circle cx="120" cy="85" r="4" fill="#14b8a6" opacity="0.6" />
      <circle cx="90" cy="115" r="3" fill="#f97316" opacity="0.5" />
      <circle cx="110" cy="115" r="3" fill="#10b981" opacity="0.5" />

      {/* Gradient Definitions */}
      <defs>
        {/* Background gradient */}
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#1e293b" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
        </linearGradient>

        {/* Glow gradient */}
        <radialGradient id="glow">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#f97316" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.1" />
        </radialGradient>

        {/* Wave gradients */}
        <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>

        <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>

        <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        {/* Pulse gradient */}
        <radialGradient id="pulseGradient">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </radialGradient>
      </defs>
    </motion.svg>
  );
}

export default Logo;
