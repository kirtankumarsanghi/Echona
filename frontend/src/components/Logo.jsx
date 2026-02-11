import { motion } from "framer-motion";

function Logo({ size = "w-12 h-12" }) {
  // Animation for the equalizer bars
  const barVariants = {
    initial: { scaleX: 1 },
    animate: (custom) => ({
      scaleX: [1, 1.1, 1, 0.9, 1], // Subtle horizontal breathe
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        delay: custom * 0.2,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <div className={`relative flex items-center justify-center ${size}`}>
      <motion.svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <defs>
          <linearGradient id="mainGradient" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#818cf8" /> {/* Indigo-400 */}
            <stop offset="50%" stopColor="#c084fc" /> {/* Purple-400 */}
            <stop offset="100%" stopColor="#f472b6" /> {/* Pink-400 */}
          </linearGradient>
          <linearGradient id="glowGradient" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#d946ef" stopOpacity="0.5" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Shape - Soft Hexagon/Circle Hybrid */}
        <motion.path
          d="M 50 10 
             L 85 25 
             L 85 75 
             L 50 90 
             L 15 75 
             L 15 25 
             Z"
          fill="url(#mainGradient)"
          fillOpacity="0.15"
          stroke="url(#mainGradient)"
          strokeWidth="2"
          strokeLinejoin="round"
          initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ vectorEffect: "non-scaling-stroke" }}
        />

        {/* Rotating Dashed Ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="35"
          stroke="url(#glowGradient)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          initial={{ rotate: 0, opacity: 0 }}
          animate={{ rotate: 360, opacity: 0.7 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        {/* The 'E' Shape - Stylized as Abstract Audio Waves */}
        <g transform="translate(28, 30)">
          {/* Top Bar */}
          <motion.rect
            x="0"
            y="0"
            width="44"
            height="8"
            rx="4"
            fill="url(#mainGradient)"
            custom={0}
            variants={barVariants}
            initial="initial"
            animate="animate"
          />
          
          {/* Middle Bar (Short + Indented) */}
          <motion.rect
            x="0"
            y="16"
            width="32"
            height="8"
            rx="4"
            fill="url(#mainGradient)"
            custom={1}
            variants={barVariants}
            initial="initial"
            animate="animate"
          />

          {/* Bottom Bar */}
          <motion.rect
            x="0"
            y="32"
            width="44"
            height="8"
            rx="4"
            fill="url(#mainGradient)"
            custom={2}
            variants={barVariants}
            initial="initial"
            animate="animate"
          />
        </g>

        {/* Decorative Particles */}
        <motion.circle
          cx="78"
          cy="28"
          r="3"
          fill="#f472b6"
          fillOpacity="0.8"
          animate={{ y: [-2, 2, -2], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="22"
          cy="72"
          r="2"
          fill="#818cf8"
          fillOpacity="0.8"
          animate={{ y: [2, -2, 2], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </motion.svg>
    </div>
  );
}

export default Logo;
