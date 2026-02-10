import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ThemeToggle from "../components/ThemeToggle";
import QuickActions from "../components/QuickActions";
import BreathingExercise from "../components/BreathingExercise";
import MeditationTimer from "../components/MeditationTimer";
import Logo from "../components/Logo";
import UserGuide from "../components/UserGuide";

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "TRACK",
      title: "Mood Tracking",
      description: "Track your emotional journey with multiple detection methods",
      gradient: "from-amber-500 to-orange-500",
      path: "/mood-detect"
    },
    {
      icon: "ANALYZE",
      title: "Analytics & Insights",
      description: "Visualize patterns and trends in your emotional wellbeing",
      gradient: "from-teal-500 to-emerald-500",
      path: "/dashboard"
    },
    {
      icon: "LISTEN",
      title: "Personalized Music",
      description: "Get music recommendations based on your current mood",
      gradient: "from-orange-500 to-rose-500",
      path: "/music"
    },
    {
      icon: "JOURNAL",
      title: "Mood Journal",
      description: "Add notes and reflect on your emotional experiences",
      gradient: "from-amber-500 to-yellow-500",
      path: "/mood-detect"
    },
    {
      icon: "STREAK",
      title: "Streak Tracking",
      description: "Build healthy habits with daily mood check-in streaks",
      gradient: "from-rose-500 to-pink-500",
      path: "/dashboard"
    },
    {
      icon: "DETECT",
      title: "AI Detection",
      description: "Use camera, voice, or text to automatically detect your mood",
      gradient: "from-teal-500 to-cyan-500",
      path: "/mood-detect"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white px-6 overflow-hidden relative">
      
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Multiple Gradient Orbs */}
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.3, 1.1, 1],
            rotate: [0, 180, 360, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/40 via-blue-500/30 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -120, 60, 0],
            y: [0, 100, -60, 0],
            scale: [1, 1.4, 1.2, 1],
            rotate: [0, -180, -360, 0],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-gradient-to-tl from-purple-500/40 via-pink-500/30 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -80, 40, 0],
            scale: [1, 1.5, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-gradient-to-tl from-teal-500/40 via-emerald-500/30 to-transparent rounded-full blur-3xl"
        />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e508_1px,transparent_1px),linear-gradient(to_bottom,#4f46e508_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent)]" />
        
        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-28">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center"
        >

          {/* Minimalist Logo */}
          <motion.div
            variants={itemVariants}
            className="relative mb-12"
          >
            <div className="relative flex items-center justify-center">
              {/* Modern Minimal Logo */}
              <div className="relative">
                {/* Subtle glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-orange-500/20 to-teal-500/20 rounded-full blur-3xl" />
                
                {/* Logo Component */}
                <div className="relative">
                  <Logo size="w-32 h-32 md:w-40 md:h-40" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Modern Title */}
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h1 className="text-7xl md:text-9xl font-bold tracking-tight mb-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-orange-200">
                ECHONA
              </span>
            </h1>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto" />
          </motion.div>

          {/* Subtitle */}
          <motion.div variants={itemVariants} className="mb-16">
            <p className="text-base md:text-lg text-gray-400 text-center font-light max-w-xl mx-auto">
              Your emotional AI companion
            </p>
            <p className="text-sm md:text-base text-gray-500 text-center font-light mt-3 max-w-2xl mx-auto">
              Detect your mood • Track your feelings • Discover personalized music
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16"
          >
            <motion.div
              whileHover={{ y: -4 }}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-300"
            >
              <div className="text-xs font-black tracking-widest mb-3 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">AI</div>
              <h3 className="text-lg font-semibold mb-2 text-white">AI Detection</h3>
              <p className="text-sm text-gray-400 font-light">Advanced mood analysis using AI</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300"
            >
              <div className="text-xs font-black tracking-widest mb-3 bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">DATA</div>
              <h3 className="text-lg font-semibold mb-2 text-white">Analytics</h3>
              <p className="text-sm text-gray-400 font-light">Track your emotional journey</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-teal-500/50 transition-all duration-300"
            >
              <div className="text-xs font-black tracking-widest mb-3 bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">AUDIO</div>
              <h3 className="text-lg font-semibold mb-2 text-white">Music</h3>
              <p className="text-sm text-gray-400 font-light">Personalized playlists for you</p>
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 items-center"
          >
            <motion.button
              onClick={() => navigate("/mood-detect")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 bg-white text-slate-900 rounded-full font-semibold text-base hover:bg-gray-100 transition-colors shadow-lg shadow-white/20"
            >
              Start Detecting →
            </motion.button>

            <motion.button
              onClick={() => navigate("/auth")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-full font-semibold text-base hover:bg-white/10 transition-all"
            >
              Sign In
            </motion.button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="mt-24 flex items-center justify-center gap-12 md:gap-16"
          >
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-white mb-1">6</p>
              <p className="text-xs md:text-sm text-gray-500 font-light">Mood Types</p>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-white mb-1">50+</p>
              <p className="text-xs md:text-sm text-gray-500 font-light">Songs</p>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-white mb-1">AI</p>
              <p className="text-xs md:text-sm text-gray-500 font-light">Powered</p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 w-full max-w-6xl"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(feature.path)}
                className="group relative cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity`} />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 group-hover:border-white/30 rounded-2xl p-6 transition-all">
                  <div className={`text-xs font-black tracking-widest mb-4 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center text-xs text-gray-400 group-hover:text-orange-400 transition-colors">
                    <span>Explore</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Motivational Quote Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className="mt-24 mb-16 w-full max-w-4xl"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-teal-500/10 border border-white/10 backdrop-blur-xl p-12">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-orange-500/5 to-amber-500/0" />
              </div>
              <div className="relative text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="text-sm font-black tracking-widest mb-6 text-orange-400"
                >
                  INSPIRATION
                </motion.div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Daily Motivation</p>
                <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-teal-400 italic leading-relaxed mb-6">
                  "Take care of your mind, your body will thank you. Take care of your body, your mind will thank you."
                </p>
                <p className="text-orange-400 font-semibold text-lg">— Start Your Wellness Journey Today</p>
                
                <motion.button
                  onClick={() => navigate("/mood-detect")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-8 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full font-bold text-white shadow-lg hover:shadow-orange-500/50 transition-all"
                >
                  Begin Now →
                </motion.button>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* Theme Toggle & User Guide */}
      <ThemeToggle />
      <QuickActions />
      <BreathingExercise />
      <MeditationTimer />
      <UserGuide />
    </div>
  );
}

export default Home;

