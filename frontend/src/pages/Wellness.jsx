import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import OptionsMenu from "../components/OptionsMenu";
import SEO from "../components/SEO";
import WellnessIntelligenceHub from "../components/WellnessIntelligenceHub";
import { useMood } from "../context/MoodContext";

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

      <div className="relative z-10 pt-14 lg:pt-4 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="pointer-events-none absolute inset-x-0 -top-8 -z-10 flex justify-center">
          <div className="h-44 w-[92%] rounded-full bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-emerald-500/15 blur-3xl" />
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-4 right-4 lg:top-4 lg:right-8">
          <OptionsMenu currentPage="/wellness" />
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl border border-slate-800/80 bg-slate-900/75 backdrop-blur-sm p-6 md:p-7"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-2">Wellness Workspace</p>
              <h1 className="heading-1 mb-2">Wellness Studio</h1>
              <p className="text-slate-300 text-base md:text-lg max-w-2xl">
                Focused support for reflection, recovery routines, and daily momentum.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 min-w-[280px]">
              <MetricPill label="Mood" value={wellnessMood} />
              <MetricPill label="Score" value={`${todayScore}/10`} />
              <MetricPill label="Streak" value={`${streak}d`} />
              <MetricPill label="Trend" value={trendLabel} toneClass={moodToneClass} />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => navigate("/mood-detect")} className="btn-secondary text-sm">
              New Check-In
            </button>
            <button type="button" onClick={() => navigate("/music")} className="btn-secondary text-sm">
              Open Music
            </button>
            <button type="button" onClick={() => navigate("/todo")} className="btn-secondary text-sm">
              Plan Focus Block
            </button>
            {miniPlayer?.song?.title && (
              <span className="ml-auto text-xs text-slate-400">
                Active track: <span className="text-slate-200">{miniPlayer.song.title}</span>
              </span>
            )}
          </div>
        </motion.header>

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
            transition={{ delay: 0.05 }}
            className="card-premium p-5 md:p-6"
            aria-label="Wellness corner"
          >
            <SectionHeader
              eyebrow="Guided Tools"
              title="Wellness Corner"
              subtitle="Quick interventions for breathing, calming, and regulation."
              badge="Recovery"
              badgeClass="text-indigo-200 border-indigo-500/30 bg-indigo-500/10"
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
            transition={{ delay: 0.1 }}
            className="card-premium p-5 md:p-6"
            aria-label="Mini challenges"
          >
            <SectionHeader
              eyebrow="Progress Layer"
              title="Mini Challenges"
              subtitle="Small, measurable wins that keep your routine consistent."
              badge="Gamified"
              badgeClass="text-amber-200 border-amber-500/30 bg-amber-500/10"
            />

            <p className="text-sm text-slate-300 mb-4 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5">
              {miniPlayer?.song?.title
                ? `Now linked to: ${miniPlayer.song.title}`
                : "Start a track in Music to unlock song-specific challenge tracking here."}
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

function MetricPill({ label, value, toneClass }) {
  return (
    <div className={`rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-2 ${toneClass || ""}`}>
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
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1">{eyebrow}</p>
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
