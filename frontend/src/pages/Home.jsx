import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import Logo from "../components/Logo";
import axiosInstance from "../api/axiosInstance";
import { MOTION, fadeInUp, sectionReveal, staggerContainer } from "../utils/motion";

function Home() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [platformStatus, setPlatformStatus] = useState({
    backend: "checking",
    mlService: "checking",
    storage: "checking",
    spotify: "checking",
    uptime: null,
  });

  const itemFade = fadeInUp;

  const featureCards = [
    {
      tag: "Assess",
      title: "Mood Check-In",
      desc: "Capture your current emotional state using text, voice, or camera and start with a clear baseline.",
      tone: "from-slate-400/10 to-slate-400/0",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 3.104v5.714M14.25 3.104v5.714M3.75 10.5h16.5M5.25 5.25h13.5a1.5 1.5 0 011.5 1.5v11.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5z" />
        </svg>
      ),
    },
    {
      tag: "Support",
      title: "Music Guidance",
      desc: "Use curated listening suggestions matched to your mood so you can regulate focus, stress, and energy.",
      tone: "from-slate-400/10 to-slate-400/0",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19V6l12-2v13M9 19a2 2 0 11-4 0 2 2 0 014 0zm12-2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      tag: "Track",
      title: "Wellness Tracking",
      desc: "Review mood trends, journal entries, and planner progress in one organized daily workflow.",
      tone: "from-slate-400/10 to-slate-400/0",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h10.5" />
        </svg>
      ),
    },
  ];

  const metrics = [
    { label: "Check-In Methods", value: "3" },
    { label: "Wellness Modules", value: "7" },
    { label: "Daily Review", value: "< 2 min" },
  ];

  const liveSignals = [
    { label: "Mood Check-In", value: "Available", color: "bg-emerald-400" },
    { label: "Music Support", value: "Ready", color: "bg-amber-400" },
    { label: "History Tracking", value: "Saved", color: "bg-zinc-300" },
  ];

  const homePrinciples = [
    "Fast daily check-in",
    "Clear next actions",
    "Consistent weekly progress",
  ];

  const steps = [
    "Complete a short mood check-in.",
    "Review your recent trend and daily status.",
    "Take action with music, planning, and journaling tools.",
  ];

  const guidedFlow = [
    {
      id: "01",
      title: "Detect Your Mood",
      detail: "Use text, voice, or camera check-in to establish your current emotional baseline.",
      action: "Open Mood Detection",
      href: "/mood-detect",
    },
    {
      id: "02",
      title: "Choose a Support Path",
      detail: "Select guided music and support tools aligned with your current mood and energy.",
      action: "Open Music",
      href: "/music",
    },
    {
      id: "03",
      title: "Track Daily Progress",
      detail: "Keep mood logs, planner updates, and journal notes in a single structured workspace.",
      action: "Open Dashboard",
      href: "/dashboard",
    },
  ];

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const { data } = await axiosInstance.get("/api/health");
        if (!mounted) return;

        const deps = data?.dependencies || {};
        const mongo = String(deps.mongodb || "unknown").toLowerCase();
        const ml = String(deps?.mlService?.status || "unknown").toLowerCase();
        const spotify = String(deps.spotify || "unknown").toLowerCase();

        setPlatformStatus({
          backend: data?.status === "ok" ? "online" : "degraded",
          mlService: ml === "ok" ? "online" : ml === "unavailable" ? "degraded" : "checking",
          storage: mongo === "connected" ? "online" : mongo === "disconnected" ? "degraded" : "checking",
          spotify: spotify === "configured" ? "online" : spotify === "not configured" ? "degraded" : "checking",
          uptime: Number.isFinite(Number(data?.uptime)) ? Number(data.uptime) : null,
        });
      } catch {
        if (!mounted) return;
        setPlatformStatus({
          backend: "degraded",
          mlService: "checking",
          storage: "checking",
          spotify: "checking",
          uptime: null,
        });
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const statusTone = (value) => {
    if (value === "online") return "text-emerald-300";
    if (value === "degraded") return "text-amber-300";
    return "text-slate-300";
  };

  const statusDot = (value) => {
    if (value === "online") return "bg-emerald-400";
    if (value === "degraded") return "bg-amber-400";
    return "bg-slate-400";
  };

  const statusLabel = (value) => {
    if (value === "online") return "Live";
    if (value === "degraded") return "Attention Needed";
    return "Checking";
  };

  return (
    <div className="min-h-screen bg-[#090a0d] text-zinc-100">
      <SEO
        title="ECHONA - Mental Wellness Platform"
        description="Professional mental wellness platform with mood detection, recommendations, and wellness analytics."
      />
      <Navbar />

      <motion.section
        variants={reduceMotion ? undefined : sectionReveal}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "show"}
        className="relative overflow-hidden pt-28 sm:pt-32 pb-14 sm:pb-16 md:pt-40 md:pb-20 border-b border-zinc-800/80"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_45%),linear-gradient(to_bottom,rgba(18,19,24,0.92),rgba(9,10,13,0.98))]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 sm:gap-10 items-center">
          <motion.div
            variants={reduceMotion ? undefined : staggerContainer}
            initial={reduceMotion ? false : "hidden"}
            animate={reduceMotion ? undefined : "show"}
            className="max-w-3xl"
          >
            <motion.span
              variants={itemFade}
              className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-900/90 text-zinc-200 border border-zinc-700/80 text-[11px] sm:text-xs font-semibold tracking-wide mb-5 sm:mb-6"
            >
              Personal Wellness Workspace
            </motion.span>
            <motion.h1 variants={itemFade} className="heading-1 mb-4 max-w-2xl text-4xl sm:text-5xl lg:text-[3.2rem] leading-[1.08] text-balance">
              Mental wellness tools built for daily consistency.
            </motion.h1>
            <motion.p variants={itemFade} className="text-base sm:text-lg md:text-xl text-zinc-200 mb-7 sm:mb-8 max-w-2xl leading-relaxed">
              Check in quickly, follow practical support steps, and track progress in a clear routine you can sustain.
            </motion.p>
            <motion.div variants={itemFade} className="flex flex-wrap gap-3 sm:gap-3.5">
              <button onClick={() => navigate("/auth")} className="btn-primary min-w-[170px] h-11 sm:h-12">
                Start Now
              </button>
              <a href="#features" className="btn-secondary min-w-[170px] h-11 sm:h-12">
                Explore Features
              </a>
              <a href="#how-it-works" className="btn-secondary min-w-[170px] h-11 sm:h-12">
                View Workflow
              </a>
            </motion.div>

            <motion.div variants={itemFade} className="mt-7 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
              {metrics.map((item) => (
                <div key={item.label} className="rounded-xl border border-zinc-800/90 bg-zinc-900/80 px-4 py-3 relative overflow-hidden">
                  <p className="text-lg font-semibold text-zinc-100">{item.value}</p>
                  <p className="text-[11px] text-zinc-300 uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: MOTION.duration.base, delay: MOTION.stagger.fast, ease: MOTION.ease }}
            className="relative"
          >
            <div className="card-premium p-6 md:p-8 rounded-3xl border-zinc-700/70 bg-zinc-900/88 relative overflow-hidden min-h-[330px] sm:min-h-[360px]">
              <div className="flex items-center justify-between mb-6">
                <Logo size="default" showText={false} className="scale-105" />
                <span className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700">
                  Service Status
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-semibold text-zinc-100 mb-3">Built for structured, day-to-day check-ins.</h3>
              <p className="text-sm text-zinc-200 leading-6 mb-5">
                Monitor your wellbeing with a steady routine across mood check-ins, guided music support, and progress tracking.
              </p>

              <div className="grid md:grid-cols-[1.25fr_0.75fr] gap-4">
                <div className="space-y-2.5">
                  {liveSignals.map((signal) => (
                    <div key={signal.label} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${signal.color}`} />
                        <p className="text-sm text-zinc-100 font-medium">{signal.label}</p>
                      </div>
                      <p className="text-[11px] uppercase tracking-wider text-zinc-300">{signal.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2.5">Operating Principles</p>
                  <div className="space-y-2">
                    {homePrinciples.map((principle) => (
                      <div key={principle} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/70 px-2.5 py-2">
                        <p className="text-[11px] text-zinc-200">{principle}</p>
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" aria-hidden="true" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="pt-3 pb-8 sm:pb-10"
        variants={reduceMotion ? undefined : sectionReveal}
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "show"}
        viewport={{ once: true, margin: "-120px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="workspace-surface p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Platform Availability</p>
                <h3 className="text-base sm:text-lg font-semibold text-slate-100">Service status overview</h3>
              </div>
              <p className="text-xs text-slate-400">
                {platformStatus.uptime !== null ? `Backend uptime: ${platformStatus.uptime}s` : "Uptime loading..."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                { label: "Backend API", value: platformStatus.backend },
                { label: "ML Service", value: platformStatus.mlService },
                { label: "Data Storage", value: platformStatus.storage },
                { label: "Spotify Integration", value: platformStatus.spotify },
              ].map((item) => (
                <div key={item.label} className="workspace-surface-soft px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-wider opacity-80">{item.label}</p>
                  <p className={`text-sm font-semibold mt-1 inline-flex items-center gap-2 ${statusTone(item.value)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot(item.value)}`} aria-hidden="true" />
                    {statusLabel(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="features"
        className="section-spacing border-y border-slate-900/80 bg-slate-950/50"
        variants={reduceMotion ? undefined : sectionReveal}
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "show"}
        viewport={{ once: true, margin: "-120px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="heading-2 mb-2 text-2xl sm:text-3xl">Core Product Features</h2>
            <p className="text-slate-300 text-sm sm:text-base">Essential tools for check-ins, support, and consistent progress tracking.</p>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5">
            {featureCards.map((feature, index) => (
              <article
                key={feature.title}
                className={`card p-5 sm:p-6 flex flex-col justify-between ${
                  index === 0
                    ? "xl:col-span-7 xl:row-span-2 min-h-[300px]"
                    : "xl:col-span-5 min-h-[220px]"
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center mb-3">
                    {feature.icon}
                  </div>
                  <span className="inline-flex mb-3 px-2.5 py-1 rounded-md text-[11px] tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {feature.tag}
                  </span>
                  <h3 className="heading-4 mb-2">{feature.title}</h3>
                  <p className="text-slate-300 text-sm leading-6">{feature.desc}</p>
                  {index === 0 && (
                    <div className="mt-4 grid sm:grid-cols-3 gap-2.5">
                      {metrics.map((item) => (
                        <div key={item.label} className="workspace-surface-soft px-3 py-2">
                          <p className="text-base font-semibold text-slate-100 leading-none">{item.value}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4 h-px bg-slate-800" />
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="product-flow"
        className="pb-6 sm:pb-10"
        variants={reduceMotion ? undefined : sectionReveal}
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "show"}
        viewport={{ once: true, margin: "-120px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="heading-2 text-2xl sm:text-3xl mb-2">Getting Started</h2>
            <p className="text-slate-300 text-sm sm:text-base">Follow this sequence to set up a reliable daily wellness routine.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {guidedFlow.map((item, idx) => (
              <motion.article
                key={item.id}
                variants={reduceMotion ? undefined : itemFade}
                initial={reduceMotion ? false : "hidden"}
                whileInView={reduceMotion ? undefined : "show"}
                viewport={{ once: true, margin: "-90px" }}
                transition={reduceMotion ? undefined : { delay: idx * MOTION.stagger.fast, duration: MOTION.duration.base, ease: MOTION.ease }}
                className="card-premium card-hover p-5"
              >
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Step {item.id}</p>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-300 leading-6 mb-4">{item.detail}</p>
                <button
                  onClick={() => navigate(item.href)}
                  className="btn-ghost text-sm !px-0 !py-0 hover:!bg-transparent text-primary-200 hover:text-primary-100"
                >
                  {item.action} {"->"}
                </button>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="how-it-works"
        className="py-12 md:py-16 bg-slate-950 border-y border-slate-800 relative overflow-hidden"
        variants={reduceMotion ? undefined : sectionReveal}
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "show"}
        viewport={{ once: true, margin: "-120px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 sm:gap-10 items-start">
          <div className="relative">
            <h2 className="heading-2 mb-2 text-2xl sm:text-3xl">How It Works</h2>
            <p className="text-slate-300 text-sm sm:text-base mb-6">A simple three-step flow built for consistency and clarity.</p>
            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-700" aria-hidden="true" />
              <ol className="space-y-4 relative">
              {steps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 relative">
                  <span className="w-7 h-7 mt-0.5 rounded-full bg-slate-800 text-slate-200 text-sm font-semibold flex items-center justify-center border border-slate-700 z-10">
                    {index + 1}
                  </span>
                  <span className="text-slate-200 text-sm sm:text-base">{step}</span>
                </li>
              ))}
              </ol>
            </div>
          </div>
          <div className="workspace-surface p-6">
            <h3 className="heading-4 mb-3">Designed for Daily Check-ins</h3>
            <p className="text-slate-300 text-sm leading-6 mb-4">
              Use ECHONA as part of your daily routine to identify patterns, reduce emotional friction, and make better wellness decisions.
            </p>
            <ul className="text-sm text-slate-200 space-y-2">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Consistent scoring and trend tracking</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-400" />Professional dashboard for quick review</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />Guided recommendations for next actions</li>
            </ul>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="section-spacing"
        variants={reduceMotion ? undefined : sectionReveal}
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "show"}
        viewport={{ once: true, margin: "-120px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden workspace-header-surface p-6 sm:p-8 md:p-10">

            <div className="relative grid lg:grid-cols-[1.3fr_0.7fr] gap-6 sm:gap-8 items-start lg:items-center">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-[11px] sm:text-xs font-semibold tracking-wide mb-4">
                  Quick onboarding
                </span>
                <h2 className="heading-3 text-2xl sm:text-3xl md:text-4xl mb-3">Start your first check-in today.</h2>
                <p className="text-slate-300 text-sm sm:text-base max-w-2xl mb-5">
                  Use ECHONA to establish a dependable wellbeing routine with check-ins, support tools, and clear progress visibility.
                </p>

                <div className="grid sm:grid-cols-3 gap-2.5 mb-6">
                  <div className="workspace-surface-soft px-3 py-2 text-xs text-slate-300">No setup complexity</div>
                  <div className="workspace-surface-soft px-3 py-2 text-xs text-slate-300">Persistent progress history</div>
                  <div className="workspace-surface-soft px-3 py-2 text-xs text-slate-300">Built for daily routine</div>
                </div>

                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  <button onClick={() => navigate("/auth")} className="btn-primary">
                    Continue Secure Sign-In
                  </button>
                  <a href="#features" className="btn-secondary">
                    Explore Features
                  </a>
                </div>
              </div>

              <motion.div
                whileHover={reduceMotion ? undefined : { y: -4 }}
                transition={reduceMotion ? undefined : { duration: 0.25, ease: "easeOut" }}
                className="workspace-surface p-4 sm:p-5"
              >
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-3">What you unlock</p>
                <div className="space-y-2.5 text-sm">
                  <p className="text-slate-200">Structured mood check-ins with multiple input methods.</p>
                  <p className="text-slate-200">Guided music support for focus and emotional balance.</p>
                  <p className="text-slate-200">Continuous mood, journal, and planner history.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default Home;

