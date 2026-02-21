import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

function Home() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Stats counter animation
  const [stats, setStats] = useState({ users: 0, moods: 0, accuracy: 0 });
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setStats({
        users: Math.floor(progress * 10000),
        moods: Math.floor(progress * 50000),
        accuracy: Math.floor(progress * 95)
      });

      if (currentStep >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);



  const testimonials = [
    { name: "Sarah M.", role: "Product Designer", text: "ECHONA helped me manage work stress. The mood detection is incredibly accurate!", avatar: "S", color: "from-pink-500 to-rose-500" },
    { name: "James K.", role: "Software Engineer", text: "The music recommendations are spot-on. I use it daily to maintain emotional balance.", avatar: "J", color: "from-blue-500 to-cyan-500" },
    { name: "Emily R.", role: "Teacher", text: "Finally, a mental wellness app that actually understands how I'm feeling. Life-changing!", avatar: "E", color: "from-purple-500 to-indigo-500" }
  ];

  const faqs = [
    { q: "How accurate is the mood detection?", a: "Our AI models achieve 95%+ accuracy using facial analysis, voice patterns, and text sentiment combined with advanced ML algorithms." },
    { q: "Is my data private and secure?", a: "Absolutely. All mood data is encrypted and stored locally. We never share your personal information with third parties." },
    { q: "Can I use it without Spotify?", a: "Yes! We offer YouTube integration and a built-in music library. Spotify is optional for premium playlists." },
    { q: "How much does it cost?", a: "ECHONA is free to use with all core features. Premium features like advanced analytics are optional." }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
      <SEO title="ECHONA — AI Mental Wellness" description="AI-powered mental wellness platform with mood detection, music therapy, and emotional tracking." />
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-violet-600/10 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-fuchsia-600/5 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold tracking-wide mb-8">
              #1 Mental Wellness Companion
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-100 mb-6">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Inner Balance</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-neutral-400 leading-relaxed mb-10">
              ECHONA uses AI to detect your mood and curate personalized music therapy, helping you emotional regulation and well-being.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/auth")}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-indigo-500/25 transition-all"
              >
                Get Started Free
              </motion.button>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-neutral-800/60 text-neutral-300 border border-neutral-700 rounded-full font-semibold text-lg hover:bg-neutral-800 hover:border-neutral-600 hover:text-white transition-all"
              >
                How It Works
              </a>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="aspect-[16/9] bg-gradient-to-br from-indigo-950 via-neutral-900 to-violet-950 rounded-3xl shadow-2xl ring-1 ring-white/5 overflow-hidden relative">
              {/* Animated Grid Background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)',
                  backgroundSize: '50px 50px'
                }} />
              </div>

              {/* Floating Mood Icons */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {[
                    { icon: (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ), x: "15%", y: "20%", delay: 0, color: "from-yellow-400 to-orange-400" },
                    { icon: (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ), x: "75%", y: "25%", delay: 0.2, color: "from-blue-400 to-cyan-400" },
                    { icon: (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ), x: "20%", y: "70%", delay: 0.4, color: "from-red-400 to-rose-400" },
                    { icon: (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    ), x: "80%", y: "65%", delay: 0.6, color: "from-emerald-400 to-teal-400" },
                    { icon: (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ), x: "50%", y: "15%", delay: 0.8, color: "from-pink-400 to-fuchsia-400" }
                  ].map((mood, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0.4, 0.8, 0.4],
                        scale: [0.8, 1.1, 0.8],
                        y: [0, -20, 0]
                      }}
                      transition={{
                        delay: mood.delay,
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute"
                      style={{ left: mood.x, top: mood.y }}
                    >
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${mood.color} flex items-center justify-center text-white shadow-lg backdrop-blur-sm`}>
                        {mood.icon}
                      </div>
                    </motion.div>
                  ))}

                  {/* Central Icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="w-32 h-32 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 relative"
                    >
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                      <svg className="w-16 h-16 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Connecting Lines Animation */}
              <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.2 }}>
                <motion.line
                  x1="15%" y1="20%" x2="50%" y2="50%"
                  stroke="url(#grad1)"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: [0, 1, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.line
                  x1="75%" y1="25%" x2="50%" y2="50%"
                  stroke="url(#grad2)"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: [0, 1, 0] }}
                  transition={{ duration: 4, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-100 mb-4">Complete Mental Wellness Suite</h2>
            <p className="text-lg text-neutral-400">Everything you need to understand and improve your emotional state.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Mood Detection",
                desc: "AI analysis of your facial expressions and voice to detect your true emotional state.",
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                color: "bg-indigo-500",
                glow: "group-hover:shadow-indigo-500/20"
              },
              {
                title: "Music Therapy",
                desc: "Personalized Spotify playlists generated to match or uplift your current mood.",
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                ),
                color: "bg-violet-500",
                glow: "group-hover:shadow-violet-500/20"
              },
              {
                title: "Wellness Planner",
                desc: "Organize your day with tasks prioritized by your emotional capacity.",
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
                color: "bg-fuchsia-500",
                glow: "group-hover:shadow-fuchsia-500/20"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`group p-8 rounded-2xl bg-neutral-800/40 border border-neutral-700/50 hover:border-neutral-600 hover:shadow-xl ${feature.glow} transition-all duration-300 backdrop-blur-sm`}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-100 mb-3">{feature.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-100 mb-6">How ECHONA Works</h2>
              <div className="space-y-8">
                {[
                  { title: "Check In", desc: "Take a moment to detect your mood using our AI tools." },
                  { title: "Get Insights", desc: "See accurate metrics on your emotional state." },
                  { title: "Find Balance", desc: "Listen to curated music or follow guided exercises." }
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="flex gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-neutral-100">{step.title}</h4>
                      <p className="text-neutral-400">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-neutral-800/60 p-8 rounded-3xl shadow-xl border border-neutral-700/50 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="h-4 bg-neutral-700/60 rounded w-3/4"></div>
                  <div className="h-32 bg-gradient-to-br from-indigo-900/30 to-violet-900/30 rounded-xl border border-neutral-700/30"></div>
                  <div className="h-4 bg-neutral-700/60 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 bg-neutral-900/30 border-y border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Users", value: stats.users.toLocaleString() + "+", icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )},
              { label: "Moods Detected", value: stats.moods.toLocaleString() + "+", icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )},
              { label: "AI Accuracy", value: stats.accuracy + "%", icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
              { label: "Success Rate", value: "98%", icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              )}
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-indigo-400 mb-3 flex justify-center">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-neutral-400 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* USE CASES */}
      <section className="py-24 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-100 mb-4">Perfect For Every Situation</h2>
            <p className="text-lg text-neutral-400">ECHONA adapts to your lifestyle and emotional needs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ), title: "Work Stress", desc: "Quick mood checks between meetings to maintain productivity", color: "from-blue-500 to-cyan-500" },
              { icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              ), title: "Student Life", desc: "Balance study pressure with emotional wellness tracking", color: "from-purple-500 to-pink-500" },
              { icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ), title: "Fitness Goals", desc: "Align workouts with your mental energy levels", color: "from-orange-500 to-red-500" },
              { icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              ), title: "Relationships", desc: "Understand your emotions before important conversations", color: "from-rose-500 to-pink-500" },
              { icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ), title: "Mindfulness", desc: "Track your progress toward mindfulness and inner peace", color: "from-emerald-500 to-teal-500" },
              { icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ), title: "Sleep Better", desc: "Evening wind-down routines based on your day's emotions", color: "from-indigo-500 to-purple-500" }
            ].map((useCase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl bg-neutral-800/40 border border-neutral-700/50 hover:border-neutral-600 backdrop-blur-sm transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${useCase.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-100 mb-2">{useCase.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{useCase.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-neutral-950">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-100 mb-4">Loved by Thousands</h2>
            <p className="text-lg text-neutral-400">Real stories from real users</p>
          </div>

          <motion.div
            key={activeTestimonial}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-3xl p-12 border border-neutral-700/50 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${testimonials[activeTestimonial].color} flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-lg`}>
                {testimonials[activeTestimonial].avatar}
              </div>
              <p className="text-xl text-neutral-200 leading-relaxed mb-6 italic max-w-2xl">
                "{testimonials[activeTestimonial].text}"
              </p>
              <div className="font-bold text-neutral-100">{testimonials[activeTestimonial].name}</div>
              <div className="text-neutral-400 text-sm">{testimonials[activeTestimonial].role}</div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? 'w-8 bg-indigo-500' : 'bg-neutral-600 hover:bg-neutral-500'}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-neutral-900/50">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-100 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-neutral-400">Everything you need to know about ECHONA</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-neutral-800/40 border border-neutral-700/50 rounded-2xl overflow-hidden backdrop-blur-sm"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-neutral-800/60 transition-colors"
                >
                  <span className="text-lg font-semibold text-neutral-100 pr-4">{faq.q}</span>
                  <motion.svg
                    animate={{ rotate: expandedFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-5 h-5 text-neutral-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: expandedFaq === i ? "auto" : 0,
                    opacity: expandedFaq === i ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-neutral-400 leading-relaxed">
                    {faq.a}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-neutral-950">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-indigo-900/40 via-violet-900/40 to-fuchsia-900/40 rounded-3xl p-12 md:p-16 border border-indigo-500/20 shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-neutral-100 mb-6">
                Start Your Wellness Journey Today
              </h2>
              <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
                Join thousands of users who've transformed their emotional well-being with ECHONA
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/auth")}
                className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-indigo-500/30 transition-all"
              >
                Get Started Free →
              </motion.button>
              <p className="text-neutral-400 text-sm mt-4">No credit card required • Free forever</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-neutral-900/80 border-t border-neutral-800 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-bold text-neutral-100 text-xl">ECHONA</span>
              <p className="text-neutral-500 text-xs">Mental Wellness Platform</p>
            </div>
          </div>
          <p className="text-neutral-500 text-sm">&copy; 2026 Echona Wellness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;

