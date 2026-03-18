import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import Logo from "../components/Logo";

function Home() {
  const navigate = useNavigate();

  const featureCards = [
    {
      tag: "Analyze",
      title: "Mood Detection",
      desc: "Detect mood from text, voice, or camera input with consistent scoring.",
    },
    {
      tag: "Recommend",
      title: "Music Recommendations",
      desc: "Receive context-aware playlists that align with your current emotional state.",
    },
    {
      tag: "Improve",
      title: "Wellness Tracking",
      desc: "Review mood trends and track progress over time in a structured dashboard.",
    },
  ];

  const metrics = [
    { label: "Input Modes", value: "3" },
    { label: "Core Modules", value: "7" },
    { label: "Daily Flow", value: "< 2 min" },
  ];

  const steps = [
    "Capture your mood using the method you prefer.",
    "Review your emotional trend and current score.",
    "Use recommendations and planner tools to take action.",
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SEO
        title="ECHONA - Mental Wellness Platform"
        description="Professional mental wellness platform with mood detection, recommendations, and wellness analytics."
      />
      <Navbar />

      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20 border-b border-slate-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 -left-24 w-80 h-80 bg-primary-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-10 -right-20 w-96 h-96 bg-secondary-500/10 blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-500/15 text-primary-200 border border-primary-500/30 text-xs font-semibold tracking-wide mb-6">
              ECHONA Platform
            </span>
            <h1 className="heading-1 mb-4">Support emotional wellbeing with actionable insights.</h1>
            <p className="text-lg text-slate-300 mb-8">
              ECHONA combines mood detection, structured tracking, and personalized recommendations in a clean workflow designed for daily use.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate("/auth")} className="btn-primary">
                Start Now
              </button>
              <a href="#how-it-works" className="btn-secondary">
                See Workflow
              </a>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
              {metrics.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                  <p className="text-lg font-semibold text-slate-100">{item.value}</p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="relative"
          >
            <div className="card p-6 md:p-8 rounded-3xl border-slate-700/70 bg-slate-900/80">
              <div className="flex items-center justify-between mb-6">
                <Logo size="large" showText={false} className="scale-110" />
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Platform Overview
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-semibold text-slate-100 mb-3">Built for focused, daily emotional check-ins.</h3>
              <p className="text-sm text-slate-300 leading-6 mb-5">
                ECHONA combines detection, trend tracking, and recommendations in one professional workflow that stays simple for daily use.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-xs text-slate-400 mb-1">Workflow</p>
                  <p className="text-sm text-slate-200 font-medium">Analyze, Track, Improve</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-xs text-slate-400 mb-1">Experience</p>
                  <p className="text-sm text-slate-200 font-medium">Calm, Clear, Practical</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="section-spacing">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="heading-2 mb-2">Core Product Features</h2>
            <p className="text-slate-300">Everything required to monitor and improve emotional wellness in one interface.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {featureCards.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card card-hover p-6 relative overflow-hidden"
              >
                <span className="inline-flex mb-3 px-2.5 py-1 rounded-md text-[11px] tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  {feature.tag}
                </span>
                <h3 className="heading-4 mb-2">{feature.title}</h3>
                <p className="text-slate-300 text-sm leading-6">{feature.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-12 md:py-16 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="heading-2 mb-2">How It Works</h2>
            <p className="text-slate-300 mb-6">A simple three-step flow built for consistency and clarity.</p>
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="w-7 h-7 mt-0.5 rounded-full bg-primary-500/20 text-primary-200 text-sm font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-slate-200">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="card p-6">
            <h3 className="heading-4 mb-3">Designed for Daily Check-ins</h3>
            <p className="text-slate-300 text-sm leading-6 mb-4">
              Use ECHONA as part of your daily routine to identify patterns, reduce emotional friction, and make better wellness decisions.
            </p>
            <ul className="text-sm text-slate-200 space-y-2">
              <li>Consistent scoring and trend tracking</li>
              <li>Professional dashboard for quick review</li>
              <li>Guided recommendations for next actions</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="card p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-primary-950/30 border-slate-700/70">
            <div>
              <h2 className="heading-3 mb-1">Ready to continue with ECHONA?</h2>
              <p className="text-slate-300 text-sm">Sign in to access mood detection, dashboard insights, and recommendations.</p>
            </div>
            <button onClick={() => navigate("/auth")} className="btn-primary whitespace-nowrap">
              Continue to Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

