import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import OptionsMenu from "../components/OptionsMenu";
import SEO from "../components/SEO";
import WellnessIntelligenceHub from "../components/WellnessIntelligenceHub";
import WorkspaceStateMessage from "../components/WorkspaceStateMessage";
import { useMood } from "../context/MoodContext";
import { MOTION } from "../utils/motion";

const SmartMoodFeature = lazy(() => import("../components/SmartMoodFeature"));
const BreathingExercise = lazy(() => import("../components/BreathingExercise"));
const MeditationTimer = lazy(() => import("../components/MeditationTimer"));
const MusicChallenges = lazy(() => import("../components/MusicChallenges"));

const MINI_PLAYER_STATE_KEY = "echona_mini_player_state";
const MINI_PLAYER_UPDATE_EVENT = "echona-mini-player-updated";

const LazyFallback = () => (
  <div className="flex items-center justify-center py-8">
    <div className="w-6 h-6 border-2 border-white/10 border-t-indigo-400 rounded-full animate-spin" />
  </div>
);

function readMiniPlayerState() {
  try {
    const raw = localStorage.getItem(MINI_PLAYER_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.song?.youtubeId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getCurrentStreak(entries) {
  if (!entries.length) return 0;

  const uniqueDays = [...new Set(entries.map((entry) => new Date(entry.createdAt).toDateString()))]
    .map((day) => new Date(day).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i += 1) {
    const dayDiff = (uniqueDays[i - 1] - uniqueDays[i]) / (1000 * 60 * 60 * 24);
    if (dayDiff === 1) streak += 1;
    else break;
  }
  return streak;
}

function Wellness() {
  const navigate = useNavigate();
  const { history } = useMood();
  const [miniPlayer, setMiniPlayer] = useState(() => readMiniPlayerState());

  useEffect(() => {
    const handleMiniPlayerUpdate = (event) => {
      if (event?.detail?.song?.youtubeId) {
        setMiniPlayer(event.detail);
        return;
      }
      setMiniPlayer(readMiniPlayerState());
    };

    const handleStorage = (event) => {
      if (event.key !== MINI_PLAYER_STATE_KEY) return;
      setMiniPlayer(readMiniPlayerState());
    };

    window.addEventListener(MINI_PLAYER_UPDATE_EVENT, handleMiniPlayerUpdate);
    window.addEventListener("storage", handleStorage);

    const timer = setInterval(() => {
      setMiniPlayer(readMiniPlayerState());
    }, 1000);

    return () => {
      window.removeEventListener(MINI_PLAYER_UPDATE_EVENT, handleMiniPlayerUpdate);
      window.removeEventListener("storage", handleStorage);
      clearInterval(timer);
    };
  }, []);

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [history]
  );

  const todayEntry = sortedHistory[sortedHistory.length - 1] || null;
  const todayMood = todayEntry?.mood || "Neutral";
  const todayScore = todayEntry?.score || 5;
  const streak = getCurrentStreak(sortedHistory);

  const recentSample = sortedHistory.slice(-5);
  const previousSample = sortedHistory.slice(-10, -5);
  const recentAverage = recentSample.length
    ? recentSample.reduce((sum, item) => sum + item.score, 0) / recentSample.length
    : todayScore;
  const previousAverage = previousSample.length
    ? previousSample.reduce((sum, item) => sum + item.score, 0) / previousSample.length
    : recentAverage;
  const trendDelta = recentAverage - previousAverage;
  const trendLabel = trendDelta > 0.1 ? "Improving" : trendDelta < -0.1 ? "Needs care" : "Steady";

  const wellnessMood = miniPlayer?.mood || todayMood;
  const moodToneClass =
    trendLabel === "Improving"
      ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
      : trendLabel === "Needs care"
        ? "text-rose-300 border-rose-500/30 bg-rose-500/10"
        : "text-sky-300 border-sky-500/30 bg-sky-500/10";

  return (
    <AppShell>
      <SEO title="Wellness" description="Copilot support, wellness tools, and mini challenges in one focused page." path="/wellness" />

      <div className="app-typography-refresh music-typography relative z-10 pt-14 lg:pt-4 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="pointer-events-none absolute inset-x-0 -top-8 -z-10 flex justify-center">
          <div className="h-44 w-[92%] rounded-full bg-gradient-to-r from-cyan-500/12 via-slate-500/8 to-amber-500/10 blur-3xl" />
        </div>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION.duration.section, ease: MOTION.ease }}
          className="workspace-header-surface mb-6 backdrop-blur-sm p-4 sm:p-6 md:p-7"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="music-kicker">Wellness Workspace</p>
              <h1 className="workspace-title">Wellness Studio Dashboard</h1>
              <p className="workspace-subtitle">
                A structured wellness flow for reflection, regulation, and consistent progress.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: MOTION.duration.base, ease: MOTION.ease }}
              className="shrink-0"
            >
              <OptionsMenu currentPage="/wellness" />
            </motion.div>
          </div>

          <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="workspace-surface w-full lg:w-auto p-3 sm:p-4 min-w-0 lg:min-w-[360px]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-0">
                <MetricPill label="Mood" value={wellnessMood} bordered />
                <MetricPill label="Score" value={`${todayScore}/10`} bordered />
                <MetricPill label="Streak" value={`${streak}d`} bordered />
                <MetricPill label="Trend" value={trendLabel} toneClass={moodToneClass} />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => navigate("/mood-detect")} className="btn-secondary text-sm">
              Check In Now
            </button>
            <button type="button" onClick={() => navigate("/music")} className="btn-secondary text-sm">
              Music Therapy
            </button>
            <button type="button" onClick={() => navigate("/todo")} className="btn-secondary text-sm">
              Task Planner
            </button>
            {miniPlayer?.song?.title && (
              <span className="ml-auto text-xs text-slate-400">
                Current track: <span className="text-slate-200">{miniPlayer.song.title}</span>
              </span>
            )}
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: MOTION.stagger.fast, duration: MOTION.duration.base, ease: MOTION.ease }}
          className="workspace-surface mb-8 p-5"
          aria-label="Guided wellness sequence"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-4 border-b border-slate-800/70">
            <div>
              <p className="music-kicker mb-1">Daily Wellness Protocol</p>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">Follow one clear support sequence</h2>
              <p className="text-sm text-slate-400 mt-1">Run this flow in order for better emotional recovery and daily consistency.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => navigate("/mood-detect")} className="btn-secondary text-sm">Start Flow</button>
              <button onClick={() => navigate("/todo")} className="btn-secondary text-sm">Plan Actions</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
            {[
              "Review guidance and your latest trend context.",
              "Complete one breathing, meditation, or challenge block.",
              "Continue in Music or Planner to convert insight into action.",
            ].map((step, idx) => (
              <div key={step} className="workspace-surface-soft p-3">
                <p className="music-kicker mb-1">Step {idx + 1}</p>
                <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {!history.length && (
          <div className="mb-6">
            <WorkspaceStateMessage
              title="No recent check-ins yet"
              description="Wellness recommendations improve after your first check-in. Start a quick detection to personalize this dashboard."
              actionLabel="Start Check-In"
              onAction={() => navigate("/mood-detect")}
              variant="warning"
            />
          </div>
        )}

        <WellnessIntelligenceHub
          history={history}
          todayMood={todayMood}
          todayScore={todayScore}
          trendLabel={trendLabel}
          streak={streak}
          onNavigate={(path) => navigate(path)}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-2">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: MOTION.stagger.fast, duration: MOTION.duration.base, ease: MOTION.ease }}
            className="workspace-surface p-5 md:p-6"
            aria-label="Wellness corner"
          >
            <SectionHeader
              eyebrow="Guided Tools"
              title="Regulation Toolkit"
              subtitle="Targeted interventions for breathing, calming, and reset routines."
              badge="Recovery"
              badgeClass="text-cyan-200 border-cyan-500/30 bg-cyan-500/10"
            />

            <div className="mb-4">
              <Suspense fallback={<LazyFallback />}>
                <SmartMoodFeature mood={wellnessMood} />
              </Suspense>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Suspense fallback={<LazyFallback />}>
                <BreathingExercise inline />
              </Suspense>
              <Suspense fallback={<LazyFallback />}>
                <MeditationTimer inline />
              </Suspense>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: MOTION.stagger.base, duration: MOTION.duration.base, ease: MOTION.ease }}
            className="workspace-surface p-5 md:p-6"
            aria-label="Mini challenges"
          >
            <SectionHeader
              eyebrow="Progress Layer"
              title="Challenge Track"
              subtitle="Small measurable wins that make your routine repeatable."
              badge="Gamified"
              badgeClass="text-emerald-200 border-emerald-500/30 bg-emerald-500/10"
            />

            <p className="text-sm text-slate-300 mb-4 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5">
              {miniPlayer?.song?.title
                ? `Linked track: ${miniPlayer.song.title}`
                : "Start a track in Music to unlock track-based challenge tracking."}
            </p>

            <Suspense fallback={<LazyFallback />}>
              <MusicChallenges currentSong={miniPlayer?.song || null} mood={wellnessMood} />
            </Suspense>
          </motion.section>
        </div>
      </div>
    </AppShell>
  );
}

function MetricPill({ label, value, toneClass, bordered = false }) {
  return (
    <div className={`px-2 sm:px-3 py-1.5 ${bordered ? "sm:border-r sm:border-slate-800/70" : ""} ${toneClass || ""}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-100 truncate">{value}</p>
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle, badge, badgeClass }) {
  return (
    <div className="mb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="music-kicker mb-1">{eyebrow}</p>
          <h3 className="text-xl font-semibold text-white leading-tight">{title}</h3>
          <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${badgeClass}`}>
          {badge}
        </span>
      </div>
    </div>
  );
}

export default Wellness;
