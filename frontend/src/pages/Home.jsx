import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import QuickActions from "../components/QuickActions";
import BreathingExercise from "../components/BreathingExercise";
import MeditationTimer from "../components/MeditationTimer";
import UserGuide from "../components/UserGuide";
import ThemeToggle from "../components/ThemeToggle";
import Logo from "../components/Logo";

function Home() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();

  const features = [
    {
      icon: "🧠",
      title: "AI Mood Analysis",
      description: "Advanced algorithms detect your emotional state via text, voice, or camera.",
      gradient: "from-indigo-500 to-purple-500",
      path: "/mood-detect"
    },
    {
      icon: "🎵",
      title: "Sonic Resonance",
      description: "Curated soundscapes and playlists that perfectly match your vibrational energy.",
      gradient: "from-fuchsia-500 to-pink-500",
      path: "/music"
    },
    {
      icon: "📊",
      title: "Emotional Intelligence",
      description: "Visual insights into your mood patterns, helping you understand yourself better.",
      gradient: "from-cyan-500 to-blue-500",
      path: "/dashboard"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-purple-500/30 dark:selection:bg-purple-500/30 selection:light:bg-indigo-500/30 overflow-hidden relative font-sans transition-colors duration-300">
      
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none">
        
        {/* Deep Space Gradients - Adjusted for Professional Look */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-900/10 rounded-full blur-[100px] mix-blend-screen" />
        
        {/* Animated Digital Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
        
        {/* Floating Abstract Notes/Shapes */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-[15%] w-24 h-24 border border-white/5 rounded-full blur-sm"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 left-[10%] w-32 h-32 border border-purple-500/10 rounded-full blur-md"
        />
      </div>

      <Navbar />

      {/* Main Content Container */}
      <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center mb-24">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <span className="text-sm font-medium bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent tracking-wide">
              AI-POWERED EMOTIONAL INTELLIGENCE
            </span>
          </motion.div>

          {/* Logo & Headline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 relative"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10" />
            <Logo size="w-32 h-32 md:w-40 md:h-40" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          >
            Your Rhythm
            <span className="block mt-2 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Your Emotion
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl text-lg md:text-xl text-gray-400 leading-relaxed mb-10"
          >
            Echona is your AI companion that harmonizes your mood with the perfect soundtrack. experience musical therapy tailored to your vibrational energy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button
              onClick={() => navigate("/mood-detect")}
              className="px-8 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Start Session
            </button>
            <button
              onClick={() => navigate("/music")}
              className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Explore Library
            </button>
          </motion.div>
        </div>

        {/* STATS SECTION */}
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/5 mb-32"
          >
            {[
              { label: "Active Users", value: "10k+" },
              { label: "Moods Analyzed", value: "500k+" },
              { label: "Songs Curated", value: "5k+" },
              { label: "Stress Reduced", value: "94%" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
        </motion.div>

        {/* FEATURES GRID */}
        <div className="mb-32">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Science of Sound</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our triple-layer detection system ensures we understand closer than anyone else.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                onClick={() => navigate(feature.path)}
                className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all cursor-pointer overflow-hidden"
              >
                {/* Hover Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="text-4xl mb-6 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-sm font-semibold tracking-wide uppercase opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                    Discover <span className="ml-2">→</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* TESTIMONIAL / QUOTE */}
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 p-12 md:p-20 text-center overflow-hidden mb-20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <span className="text-6xl text-white/20 font-serif leading-none">“</span>
            <h3 className="text-2xl md:text-4xl font-light italic leading-relaxed text-white/90 my-6">
              Music produces a kind of pleasure which human nature cannot do without.
              Echona brings this pleasure to your daily life.
            </h3>
            <p className="text-white/50 font-medium tracking-widest uppercase">— Confucius (Adapted)</p>
          </div>
        </div>

      </div>

      {/* Floating Helpers */}
      <QuickActions />
      <BreathingExercise />
      <MeditationTimer />
      <UserGuide />
      <ThemeToggle />
      
      {/* Scroll indicator */}
      <motion.div 
        style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
        className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 z-50"
      />
    </div>
  );
}

export default Home;

