import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import axiosInstance from "../api/axiosInstance";
import SpotifyPlayer from "../components/SpotifyPlayer";
import SpotifySearch from "../components/SpotifySearch";
import SpotifyDashboard from "../components/SpotifyDashboard";
import { getSpotifyToken, clearSpotifyTokens } from "../utils/auth";
import AppShell from "../components/AppShell";
import OptionsMenu from "../components/OptionsMenu";
import SEO from "../components/SEO";
import musicLibrary, {
  getYoutubeThumbnail,
  THUMBNAIL_PLACEHOLDER,
  spotifyPlaylists,
  motivationalQuotes,
  moodColors,
} from "../data/musicLibrary";

// Lazy-load secondary components
const SmartMoodFeature = lazy(() => import("../components/SmartMoodFeature"));
const SurpriseMe = lazy(() => import("../components/SurpriseMe"));
const BreathingExercise = lazy(() => import("../components/BreathingExercise"));
const MeditationTimer = lazy(() => import("../components/MeditationTimer"));
const MusicChallenges = lazy(() => import("../components/MusicChallenges"));

const LazyFallback = () => (
  <div className="flex items-center justify-center py-8">
    <div className="w-6 h-6 border-2 border-white/10 border-t-indigo-400 rounded-full animate-spin" />
  </div>
);

// Get API base URL for Spotify OAuth
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Subtle mood accent colors (muted for calm aesthetic)
const moodAccents = {
  Happy: { bg: "bg-amber-500/8", border: "border-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
  Sad: { bg: "bg-blue-500/8", border: "border-blue-500/20", text: "text-blue-400", dot: "bg-blue-400" },
  Angry: { bg: "bg-rose-500/8", border: "border-rose-500/20", text: "text-rose-400", dot: "bg-rose-400" },
  Anxious: { bg: "bg-purple-500/8", border: "border-purple-500/20", text: "text-purple-400", dot: "bg-purple-400" },
  Calm: { bg: "bg-emerald-500/8", border: "border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
  Excited: { bg: "bg-pink-500/8", border: "border-pink-500/20", text: "text-pink-400", dot: "bg-pink-400" },
};

// =======================================================================
// MAIN COMPONENT
// =======================================================================
function Music() {
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const currentSongRef = useRef(null);
  const songsRef = useRef([]);
  const repeatModeRef = useRef("off");

  const [currentMood, setCurrentMood] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [showSongList, setShowSongList] = useState(true);
  const [repeatMode, setRepeatMode] = useState("off");

  // Spotify state
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [spotifyDeviceId, setSpotifyDeviceId] = useState(null);

  // UI panels
  const [showWellness, setShowWellness] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showSpotifyDashboard, setShowSpotifyDashboard] = useState(false);

  // Keep refs in sync
  useEffect(() => { currentSongRef.current = currentlyPlaying; }, [currentlyPlaying]);
  useEffect(() => { songsRef.current = songs; }, [songs]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);

  const clearSpotifyToken = () => {
    clearSpotifyTokens();
    setSpotifyToken(null);
  };

  useEffect(() => {
    fetchMoodAndMusic();
    const token = getSpotifyToken();
    if (token) setSpotifyToken(token);
  }, []);

  // YouTube Iframe API
  useEffect(() => {
    if (!window.YT && !document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  const handleSongEnd = useCallback(() => {
    const mode = repeatModeRef.current;
    const currentSongs = songsRef.current;
    const current = currentSongRef.current;

    if (mode === "one") {
      if (playerRef.current) {
        try { playerRef.current.seekTo(0); playerRef.current.playVideo(); } catch {}
      }
    } else {
      const index = currentSongs.findIndex((s) => s.youtubeId === current?.youtubeId);
      const nextIndex = (index + 1) % currentSongs.length;
      if (nextIndex === 0 && mode === "off") {
        setIsPlaying(false);
      } else {
        setCurrentlyPlaying(currentSongs[nextIndex]);
        setIsPlaying(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!currentlyPlaying) return;

    const createPlayer = () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }

      const container = document.getElementById("yt-player-container");
      if (!container) return;

      playerRef.current = new window.YT.Player("yt-player-container", {
        videoId: currentlyPlaying.youtubeId,
        height: "1",
        width: "1",
        playerVars: { autoplay: 1, controls: 0, modestbranding: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: () => setIsPlaying(true),
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) handleSongEnd();
            else if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            else if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) createPlayer();
    else window.onYouTubeIframeAPIReady = createPlayer;
  }, [currentlyPlaying?.youtubeId, handleSongEnd]);

  // Keyboard shortcuts
  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return;
    try {
      const state = playerRef.current.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
    } catch {}
  }, []);

  const playNext = useCallback(() => {
    const currentSongs = songsRef.current;
    const current = currentSongRef.current;
    if (!current || currentSongs.length === 0) return;
    const index = currentSongs.findIndex((s) => s.youtubeId === current.youtubeId);
    setCurrentlyPlaying(currentSongs[(index + 1) % currentSongs.length]);
    setIsPlaying(true);
  }, []);

  const playPrev = useCallback(() => {
    const currentSongs = songsRef.current;
    const current = currentSongRef.current;
    if (!current || currentSongs.length === 0) return;
    const index = currentSongs.findIndex((s) => s.youtubeId === current.youtubeId);
    setCurrentlyPlaying(currentSongs[(index - 1 + currentSongs.length) % currentSongs.length]);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      switch (e.key) {
        case " ": e.preventDefault(); togglePlayPause(); break;
        case "ArrowRight": e.preventDefault(); playNext(); break;
        case "ArrowLeft": e.preventDefault(); playPrev(); break;
        case "Escape": if (currentSongRef.current) { e.preventDefault(); closePlayer(); } break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause, playNext, playPrev]);

  // Helpers
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchMoodAndMusic = async () => {
    try {
      const detectedMood = localStorage.getItem("detected_mood");
      let mood = "Happy";
      if (detectedMood) {
        mood = detectedMood.charAt(0).toUpperCase() + detectedMood.slice(1).toLowerCase();
        if (!musicLibrary[mood]) mood = "Happy";
      } else {
        try {
          const res = await axiosInstance.get("/api/mood/history");
          const history = res.data;
          if (history.length > 0) mood = history[history.length - 1].mood;
        } catch {}
      }
      setCurrentMood(mood);
      setSongs(shuffleArray(musicLibrary[mood] || musicLibrary.Happy));
      const quotes = motivationalQuotes[mood] || motivationalQuotes.Happy;
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    } catch {
      setCurrentMood("Happy");
      setSongs(shuffleArray(musicLibrary.Happy));
      setCurrentQuote(motivationalQuotes.Happy[0]);
    } finally {
      setLoading(false);
    }
  };

  const playSong = useCallback((song) => {
    setCurrentlyPlaying(song);
    setIsPlaying(true);
  }, []);

  const closePlayer = useCallback(() => {
    if (playerRef.current) { try { playerRef.current.destroy(); } catch {} playerRef.current = null; }
    setCurrentlyPlaying(null);
    setIsPlaying(false);
  }, []);

  const changeQuote = () => {
    if (currentMood && motivationalQuotes[currentMood]?.length > 0) {
      const quotes = motivationalQuotes[currentMood];
      setCurrentQuote({ ...quotes[Math.floor(Math.random() * quotes.length)] });
    }
  };

  const refreshSongs = () => {
    if (currentMood && musicLibrary[currentMood]) setSongs(shuffleArray(musicLibrary[currentMood]));
  };

  const cycleRepeat = () => {
    setRepeatMode((prev) => (prev === "off" ? "all" : prev === "all" ? "one" : "off"));
  };

  const accent = moodAccents[currentMood] || moodAccents.Happy;

  // =======================================================================
  // UI — Calm, Music-First Layout
  // =======================================================================
  return (
    <AppShell>
      <SEO title={`${currentMood || "Music"} — Music Therapy`} description="Mood-based music therapy with curated playlists for emotional wellness." />

      {/* Subtle ambient background — single muted glow, no animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] ${accent.dot} rounded-full opacity-[0.03] blur-[120px]`} />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 pt-14 lg:pt-4 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto ${currentlyPlaying ? "pb-28" : "pb-12"}`}>

        {/* ─── HEADER ─── */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/mood-detect")}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 rounded-xl text-sm text-neutral-400 hover:text-neutral-200 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back</span>
          </motion.button>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <OptionsMenu currentPage="/music" />
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            TIER 1: MUSIC HERO — Primary Focus
        ═══════════════════════════════════════════════════════════════ */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-neutral-700 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-neutral-400 text-sm">Curating your music...</p>
          </div>
        ) : (
          <>
            {/* Music Hero Card */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative bg-neutral-900/60 backdrop-blur-sm border border-neutral-800/80 rounded-2xl p-6 md:p-8 mb-6 overflow-hidden"
              aria-label="Music player hero"
            >
              {/* Mood indicator — subtle chip */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${accent.dot}`} />
                  <span className={`text-xs font-semibold tracking-wider uppercase ${accent.text}`}>
                    {currentMood} Mood
                  </span>
                </div>
                <button
                  onClick={() => navigate("/mood-detect")}
                  className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Change mood
                </button>
              </div>

              {/* Quote — understated */}
              {currentQuote && (
                <div className="mb-8 max-w-xl">
                  <motion.p
                    key={currentQuote.quote}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-lg md:text-xl font-medium text-neutral-200 leading-relaxed"
                  >
                    &ldquo;{currentQuote.quote}&rdquo;
                  </motion.p>
                  <div className="flex items-center gap-3 mt-3">
                    <p className="text-neutral-500 text-xs">— {currentQuote.author}</p>
                    <button onClick={changeQuote} className="text-neutral-600 hover:text-neutral-400 text-xs transition-colors">
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Music Controls — dominant, clear */}
              <div className="flex flex-wrap items-center gap-2.5">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => playSong(songs[0])}
                  className="px-6 py-2.5 bg-white text-neutral-900 font-semibold rounded-full text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                  aria-label="Play all songs"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Play All
                </motion.button>

                <button
                  onClick={refreshSongs}
                  className="px-5 py-2.5 bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700/50 text-neutral-300 text-sm font-medium rounded-full transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Shuffle
                </button>

                <button
                  onClick={cycleRepeat}
                  className={`px-4 py-2.5 border rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                    repeatMode === "off"
                      ? "border-neutral-700/50 text-neutral-500 hover:text-neutral-300"
                      : "border-indigo-500/40 text-indigo-400 bg-indigo-500/10"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {repeatMode === "off" ? "Repeat" : repeatMode === "all" ? "All" : "One"}
                </button>

                <button
                  onClick={() => setShowSongList(!showSongList)}
                  className="px-4 py-2.5 bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700/50 text-neutral-300 text-sm font-medium rounded-full transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  {showSongList ? "Hide" : "Show"} ({songs.length})
                </button>
              </div>

              <p className="text-neutral-600 text-[11px] mt-4">
                Space = play/pause · ← → = prev/next · Esc = stop
              </p>
            </motion.section>

            {/* ─── PLAYLIST ─── */}
            <AnimatePresence>
              {showSongList && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 overflow-hidden"
                  aria-label="Playlist"
                >
                  <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/80 rounded-2xl">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/50">
                      <h3 className="text-base font-semibold text-neutral-200">Your Playlist</h3>
                      <span className="text-neutral-500 text-xs">{songs.length} songs</span>
                    </div>
                    <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                      {songs.map((song, index) => {
                        const isActive = currentlyPlaying?.youtubeId === song.youtubeId;
                        return (
                          <motion.div
                            key={song.youtubeId || index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.015 }}
                            className={`flex items-center gap-3 px-6 py-3 transition-all cursor-pointer group border-b border-neutral-800/30 last:border-0 ${
                              isActive
                                ? "bg-white/[0.04]"
                                : "hover:bg-white/[0.02]"
                            }`}
                            onClick={() => playSong(song)}
                          >
                            {isActive ? (
                              <div className="w-6 flex justify-center">
                                <div className="flex items-end gap-0.5 h-3.5">
                                  <motion.div animate={{ height: ["40%", "100%", "60%"] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-0.5 bg-indigo-400 rounded-full" />
                                  <motion.div animate={{ height: ["100%", "40%", "80%"] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-0.5 bg-indigo-400 rounded-full" />
                                  <motion.div animate={{ height: ["60%", "100%", "40%"] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-0.5 bg-indigo-400 rounded-full" />
                                </div>
                              </div>
                            ) : (
                              <span className="text-neutral-600 text-xs font-mono w-6 text-center group-hover:text-neutral-400">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                            )}
                            <img
                              src={getYoutubeThumbnail(song.youtubeId)}
                              className="w-10 h-10 rounded-lg object-cover"
                              alt={song.title}
                              onError={(e) => { e.target.src = THUMBNAIL_PLACEHOLDER; }}
                              loading="lazy"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm truncate ${isActive ? "text-indigo-300" : "text-neutral-200"}`}>
                                {song.title}
                              </p>
                              <p className="text-neutral-500 text-xs truncate">{song.artist}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              song.isBollywood
                                ? "bg-rose-500/10 text-rose-400/70"
                                : "bg-teal-500/10 text-teal-400/70"
                            }`}>
                              {song.isBollywood ? "Hindi" : "EN"}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════════════════════
                TIER 2: AI & SPOTIFY — Context-Aware Recommendations
            ═══════════════════════════════════════════════════════════════ */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6 space-y-4"
              aria-label="Music discovery"
            >
              {/* Spotify Connection — integrated, minimal */}
              <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-200">Spotify</h4>
                      <p className="text-[11px] text-neutral-500">
                        {getSpotifyToken() ? "Connected — stream directly" : "Connect for in-browser playback"}
                      </p>
                    </div>
                  </div>
                  {getSpotifyToken() ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-full">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[11px] text-green-400 font-medium">Connected</span>
                      </div>
                      {spotifyToken && (
                        <button
                          onClick={() => setShowSpotifyDashboard(!showSpotifyDashboard)}
                          className="px-3 py-1.5 text-[11px] text-neutral-400 hover:text-neutral-200 border border-neutral-700/50 rounded-full transition-colors"
                        >
                          {showSpotifyDashboard ? "Hide Library" : "My Library"}
                        </button>
                      )}
                      <button
                        onClick={clearSpotifyToken}
                        className="p-1.5 text-neutral-600 hover:text-red-400 transition-colors rounded-lg"
                        aria-label="Disconnect Spotify"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <a
                      href={`${API_BASE_URL}/api/spotify/login`}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-full transition-all"
                    >
                      Connect
                    </a>
                  )}
                </div>
              </div>

              {/* Spotify Player — when connected */}
              {spotifyToken && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                  <SpotifyPlayer accessToken={spotifyToken} onPlayerReady={(deviceId) => setSpotifyDeviceId(deviceId)} />
                </motion.div>
              )}

              {/* Spotify Dashboard — collapsible */}
              <AnimatePresence>
                {spotifyToken && showSpotifyDashboard && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SpotifyDashboard spotifyToken={spotifyToken} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search — always available */}
              <SpotifySearch accessToken={spotifyToken} deviceId={spotifyDeviceId} />

              {/* Extended Playlist Link */}
              <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-200">More {currentMood} Music</h4>
                      <p className="text-[11px] text-neutral-500">Curated playlist on Spotify</p>
                    </div>
                  </div>
                  <a
                    href={spotifyPlaylists[currentMood]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700/50 text-neutral-300 text-xs font-medium rounded-full transition-all"
                  >
                    Open →
                  </a>
                </div>
              </div>
            </motion.section>

            {/* ═══════════════════════════════════════════════════════════════
                TIER 3: AI SURPRISE — Non-intrusive recommendation
            ═══════════════════════════════════════════════════════════════ */}
            <Suspense fallback={<LazyFallback />}>
              <SurpriseMe />
            </Suspense>

            {/* ═══════════════════════════════════════════════════════════════
                TIER 4: WELLNESS — Collapsed by default
            ═══════════════════════════════════════════════════════════════ */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 mb-6"
              aria-label="Wellness support"
            >
              <button
                onClick={() => setShowWellness(!showWellness)}
                className="w-full flex items-center justify-between px-5 py-4 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl transition-all hover:bg-neutral-800/40 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-medium text-neutral-300 group-hover:text-neutral-200 transition-colors">Wellness Corner</h4>
                    <p className="text-[11px] text-neutral-600">Journaling, breathing & mood support</p>
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-neutral-600 transition-transform duration-300 ${showWellness ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {showWellness && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 space-y-4">
                      <Suspense fallback={<LazyFallback />}>
                        <SmartMoodFeature mood={currentMood} />
                      </Suspense>

                      {/* Inline Wellness Tools */}
                      <div className="grid grid-cols-2 gap-3">
                        <Suspense fallback={<LazyFallback />}>
                          <BreathingExercise inline />
                        </Suspense>
                        <Suspense fallback={<LazyFallback />}>
                          <MeditationTimer inline />
                        </Suspense>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* ═══════════════════════════════════════════════════════════════
                TIER 5: GAMIFICATION — Side Drawer Toggle
            ═══════════════════════════════════════════════════════════════ */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mb-6"
              aria-label="Challenges"
            >
              <button
                onClick={() => setShowChallenges(!showChallenges)}
                className="w-full flex items-center justify-between px-5 py-4 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl transition-all hover:bg-neutral-800/40 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-medium text-neutral-300 group-hover:text-neutral-200 transition-colors">Mini Challenges</h4>
                    <p className="text-[11px] text-neutral-600">Earn badges while you listen</p>
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-neutral-600 transition-transform duration-300 ${showChallenges ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </motion.section>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PERSISTENT BOTTOM PLAYER
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {currentlyPlaying && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800/80"
          >
            <div className="max-w-6xl mx-auto px-4 py-3">
              <div className="flex items-center gap-4">
                <img
                  src={getYoutubeThumbnail(currentlyPlaying.youtubeId)}
                  alt={currentlyPlaying.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => { e.target.src = THUMBNAIL_PLACEHOLDER; }}
                />
                <div className="flex-1 min-w-0 hidden sm:block">
                  <p className="text-neutral-100 font-medium text-sm truncate">{currentlyPlaying.title}</p>
                  <p className="text-neutral-500 text-xs truncate">{currentlyPlaying.artist}</p>
                </div>
                <div className="flex-1 min-w-0 sm:hidden">
                  <p className="text-neutral-100 font-medium text-xs truncate">{currentlyPlaying.title}</p>
                  <p className="text-neutral-600 text-[10px] truncate">{currentlyPlaying.artist}</p>
                </div>

                {/* Controls — high contrast, clear */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button onClick={playPrev} className="p-2 text-neutral-500 hover:text-white transition-colors" aria-label="Previous">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                    </svg>
                  </button>
                  <button
                    onClick={togglePlayPause}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5 text-neutral-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-neutral-900 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    )}
                  </button>
                  <button onClick={playNext} className="p-2 text-neutral-500 hover:text-white transition-colors" aria-label="Next">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                    </svg>
                  </button>
                  <button
                    onClick={cycleRepeat}
                    className={`p-2 hidden sm:block transition-colors relative ${repeatMode === "off" ? "text-neutral-600" : "text-indigo-400"}`}
                    title={`Repeat: ${repeatMode}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {repeatMode === "one" && <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold text-indigo-400">1</span>}
                  </button>
                  <button onClick={closePlayer} className="p-2 text-neutral-600 hover:text-red-400 transition-colors ml-1" aria-label="Close">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="sr-only" aria-hidden="true"><div id="yt-player-container" /></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          CHALLENGES SIDE DRAWER — slides in from right
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showChallenges && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChallenges(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-neutral-950 border-l border-neutral-800 z-[61] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-neutral-200">Mini Challenges</h2>
                  <button
                    onClick={() => setShowChallenges(false)}
                    className="p-2 text-neutral-500 hover:text-neutral-200 transition-colors rounded-lg hover:bg-neutral-800"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <Suspense fallback={<LazyFallback />}>
                  <MusicChallenges currentSong={currentlyPlaying} mood={currentMood} inDrawer />
                </Suspense>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
      `}</style>
    </AppShell>
  );
}

export default Music;
