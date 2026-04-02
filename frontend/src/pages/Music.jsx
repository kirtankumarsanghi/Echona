import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from "react";
import axiosInstance from "../api/axiosInstance";
import SpotifyPlayer from "../components/SpotifyPlayer";
import SpotifySearch from "../components/SpotifySearch";
import SpotifyDashboard from "../components/SpotifyDashboard";
import MusicIntelligencePanel from "../components/MusicIntelligencePanel";
import { getSpotifyToken, clearSpotifyTokens } from "../utils/auth";
import AppShell from "../components/AppShell";
import OptionsMenu from "../components/OptionsMenu";
import SEO from "../components/SEO";
import musicLibrary, {
  getPlaylist,
  getYoutubeThumbnail,
  THUMBNAIL_PLACEHOLDER,
  spotifyPlaylists,
  motivationalQuotes,
  moodColors,
} from "../data/musicLibrary";

// Lazy-load secondary components
const SurpriseMe = lazy(() => import("../components/SurpriseMe"));

const LazyFallback = () => (
  <div className="flex items-center justify-center py-8">
    <div className="w-6 h-6 border-2 border-white/10 border-t-indigo-400 rounded-full animate-spin" />
  </div>
);

// Get API base URL for Spotify OAuth
const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const UNAVAILABLE_TRACKS_KEY = "echona_unavailable_tracks";
const LIKED_SONGS_KEY = "echona_liked_songs";
const LISTEN_HISTORY_KEY = "echona_listen_history";
const MINI_PLAYER_STATE_KEY = "echona_mini_player_state";
const MINI_PLAYER_ACTION_KEY = "echona_mini_player_action";
const MINI_PLAYER_UPDATE_EVENT = "echona-mini-player-updated";
const MINI_PLAYER_ACTION_EVENT = "echona-mini-player-action";

function loadUnavailableTrackIds() {
  try {
    const raw = localStorage.getItem(UNAVAILABLE_TRACKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveUnavailableTrackIds(ids) {
  try {
    localStorage.setItem(UNAVAILABLE_TRACKS_KEY, JSON.stringify(ids.slice(-100)));
  } catch {
    // no-op: localStorage may be unavailable in strict contexts
  }
}

function loadLikedSongs() {
  try {
    const raw = localStorage.getItem(LIKED_SONGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((song) => song?.youtubeId) : [];
  } catch {
    return [];
  }
}

function saveLikedSongs(songs) {
  try {
    localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify((songs || []).slice(0, 200)));
  } catch {
    // no-op
  }
}

function loadListenHistory() {
  try {
    const raw = localStorage.getItem(LISTEN_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((entry) => entry?.youtubeId) : [];
  } catch {
    return [];
  }
}

function saveListenHistory(history) {
  try {
    localStorage.setItem(LISTEN_HISTORY_KEY, JSON.stringify((history || []).slice(0, 300)));
  } catch {
    // no-op
  }
}

function publishMiniPlayerState(payload) {
  try {
    localStorage.setItem(MINI_PLAYER_STATE_KEY, JSON.stringify(payload || {}));
    window.dispatchEvent(new CustomEvent(MINI_PLAYER_UPDATE_EVENT, { detail: payload || {} }));
  } catch {
    // no-op
  }
}

// Subtle mood accent colors (muted for calm aesthetic)
const moodAccents = {
  Happy: { bg: "bg-amber-500/8", border: "border-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
  Sad: { bg: "bg-blue-500/8", border: "border-blue-500/20", text: "text-blue-400", dot: "bg-blue-400" },
  Angry: { bg: "bg-rose-500/8", border: "border-rose-500/20", text: "text-rose-400", dot: "bg-rose-400" },
  Anxious: { bg: "bg-purple-500/8", border: "border-purple-500/20", text: "text-purple-400", dot: "bg-purple-400" },
  Calm: { bg: "bg-emerald-500/8", border: "border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
  Excited: { bg: "bg-pink-500/8", border: "border-pink-500/20", text: "text-pink-400", dot: "bg-pink-400" },
  Stressed: { bg: "bg-red-400/8", border: "border-red-400/20", text: "text-red-400", dot: "bg-red-400" },
  Lonely: { bg: "bg-slate-400/8", border: "border-slate-400/20", text: "text-slate-400", dot: "bg-slate-400" },
  Tired: { bg: "bg-indigo-400/8", border: "border-indigo-400/20", text: "text-indigo-400", dot: "bg-indigo-400" },
  Neutral: { bg: "bg-gray-400/8", border: "border-gray-400/20", text: "text-gray-400", dot: "bg-gray-400" },
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
  const searchCacheRef = useRef(new Map());
  const isRecoveringPlaybackRef = useRef(false);

  const [currentMood, setCurrentMood] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [showSongList, setShowSongList] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [songSearchQuery, setSongSearchQuery] = useState("");
  const [songSearchLanguage, setSongSearchLanguage] = useState("Any");
  const [songSearchResults, setSongSearchResults] = useState([]);
  const [showSongSearchResults, setShowSongSearchResults] = useState(false);
  const [songSearchLoading, setSongSearchLoading] = useState(false);
  const [songSearchLoadingMore, setSongSearchLoadingMore] = useState(false);
  const [songSearchNextPageToken, setSongSearchNextPageToken] = useState("");
  const [songSearchHasMore, setSongSearchHasMore] = useState(false);
  const [searchMoodInsight, setSearchMoodInsight] = useState(null);

  // Spotify state
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [spotifyDeviceId, setSpotifyDeviceId] = useState(null);

  // UI panels
  const [showSpotifyDashboard, setShowSpotifyDashboard] = useState(false);
  const [unavailableTrackIds, setUnavailableTrackIds] = useState(() => loadUnavailableTrackIds());
  const [playlistNotice, setPlaylistNotice] = useState("");
  const [likedSongs, setLikedSongs] = useState(() => loadLikedSongs());
  const [listenHistory, setListenHistory] = useState(() => loadListenHistory());
  const [showLibrary, setShowLibrary] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekValue, setSeekValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const actionHandlersRef = useRef({
    togglePlayPause: () => {},
    playNext: () => {},
    toggleLikedSong: () => {},
  });

  const unavailableSetRef = useRef(new Set(unavailableTrackIds));

  // Keep refs in sync
  useEffect(() => { currentSongRef.current = currentlyPlaying; }, [currentlyPlaying]);
  useEffect(() => { songsRef.current = songs; }, [songs]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { unavailableSetRef.current = new Set(unavailableTrackIds); }, [unavailableTrackIds]);
  useEffect(() => { saveLikedSongs(likedSongs); }, [likedSongs]);
  useEffect(() => { saveListenHistory(listenHistory); }, [listenHistory]);

  useEffect(() => {
    if (!isSeeking) setSeekValue(currentTime);
  }, [currentTime, isSeeking]);

  useEffect(() => {
    if (!currentlyPlaying) {
      setCurrentTime(0);
      setDuration(0);
      setSeekValue(0);
    }
  }, [currentlyPlaying]);

  useEffect(() => {
    const payload = {
      updatedAt: Date.now(),
      mood: currentMood || "Neutral",
      isPlaying: Boolean(isPlaying && currentlyPlaying?.youtubeId),
      currentTime: Number(currentTime) || 0,
      duration: Number(duration) || 0,
      song: currentlyPlaying
        ? {
            youtubeId: currentlyPlaying.youtubeId,
            title: currentlyPlaying.title,
            artist: currentlyPlaying.artist,
            language: currentlyPlaying.language,
            sourceMood: currentlyPlaying.sourceMood,
            thumbnail: getYoutubeThumbnail(currentlyPlaying.youtubeId) || THUMBNAIL_PLACEHOLDER,
            isLiked: likedSongs.some((item) => item.youtubeId === currentlyPlaying.youtubeId),
          }
        : null,
    };

    publishMiniPlayerState(payload);
  }, [currentMood, isPlaying, currentTime, duration, currentlyPlaying, likedSongs]);

  useEffect(() => {
    if (!playlistNotice) return undefined;
    const timer = setTimeout(() => setPlaylistNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [playlistNotice]);

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

  const tryRecoverSongSource = useCallback(async (failedSong, failedVideoId) => {
    if (!failedSong?.title) return false;

    try {
      const query = `${failedSong.title} ${failedSong.artist || ""}`.trim();
      const { data } = await axiosInstance.get("/api/music-intel/search", {
        params: {
          q: query,
          language: failedSong.language || "Any",
          maxResults: 15,
        },
        timeout: 5000,
      });

      const candidates = Array.isArray(data?.results) ? data.results : [];
      const blocked = unavailableSetRef.current;
      const replacement = candidates.find(
        (song) => song?.youtubeId && song.youtubeId !== failedVideoId && !blocked.has(song.youtubeId)
      );

      if (!replacement) return false;

      setSongs((prev) => {
        const filtered = prev.filter(
          (song) => song.youtubeId !== failedVideoId && song.youtubeId !== replacement.youtubeId
        );
        return [replacement, ...filtered];
      });
      setCurrentlyPlaying(replacement);
      setIsPlaying(true);
      setPlaylistNotice("Original source failed. Switched to an alternate playable version.");
      return true;
    } catch {
      return false;
    }
  }, []);

  const handlePlaybackError = useCallback(async (failedVideoId) => {
    if (!failedVideoId) return;
    const failedSong = songsRef.current.find((song) => song.youtubeId === failedVideoId) || currentSongRef.current;

    setUnavailableTrackIds((prev) => {
      if (prev.includes(failedVideoId)) return prev;
      const updated = [...prev, failedVideoId];
      saveUnavailableTrackIds(updated);
      return updated;
    });

    setSongs((prev) => prev.filter((song) => song.youtubeId !== failedVideoId));
    setPlaylistNotice("A track was unavailable and has been removed from your playlist.");

    const remaining = songsRef.current.filter((song) => song.youtubeId !== failedVideoId);
    songsRef.current = remaining;

    if (!isRecoveringPlaybackRef.current && failedSong) {
      isRecoveringPlaybackRef.current = true;
      const recovered = await tryRecoverSongSource(failedSong, failedVideoId);
      isRecoveringPlaybackRef.current = false;
      if (recovered) return;
    }

    if (remaining.length === 0) {
      setCurrentlyPlaying(null);
      setIsPlaying(false);
      return;
    }

    setCurrentlyPlaying(remaining[0]);
    setIsPlaying(true);
  }, [tryRecoverSongSource]);

  useEffect(() => {
    if (!currentlyPlaying) return;

    setCurrentTime(0);
    setDuration(0);
    setSeekValue(0);

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
          onReady: () => {
            setIsPlaying(true);
            try {
              const nextDuration = Number(playerRef.current?.getDuration()) || 0;
              const nextTime = Number(playerRef.current?.getCurrentTime()) || 0;
              setDuration(nextDuration);
              setCurrentTime(nextTime);
              setSeekValue(nextTime);
            } catch {
              // no-op
            }
          },
          onError: () => handlePlaybackError(currentlyPlaying?.youtubeId),
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) handleSongEnd();
            else if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            else if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);

            try {
              const nextDuration = Number(playerRef.current?.getDuration()) || 0;
              const nextTime = Number(playerRef.current?.getCurrentTime()) || 0;
              if (nextDuration > 0) setDuration(nextDuration);
              setCurrentTime(nextTime);
            } catch {
              // no-op
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) createPlayer();
    else window.onYouTubeIframeAPIReady = createPlayer;
  }, [currentlyPlaying?.youtubeId, handleSongEnd, handlePlaybackError]);

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

  const addToHistory = useCallback((song) => {
    if (!song?.youtubeId) return;
    const historyEntry = {
      youtubeId: song.youtubeId,
      title: song.title,
      artist: song.artist,
      language: song.language,
      genre: song.genre,
      playedAt: new Date().toISOString(),
    };

    setListenHistory((prev) => {
      const deduped = prev.filter((item) => item.youtubeId !== song.youtubeId);
      return [historyEntry, ...deduped].slice(0, 50);
    });
  }, []);

  useEffect(() => {
    if (!currentlyPlaying?.youtubeId) return;
    addToHistory(currentlyPlaying);
  }, [currentlyPlaying?.youtubeId, addToHistory]);

  const isSongLiked = useCallback(
    (song) => Boolean(song?.youtubeId) && likedSongs.some((item) => item.youtubeId === song.youtubeId),
    [likedSongs]
  );

  const toggleLikedSong = useCallback((song) => {
    if (!song?.youtubeId) return;
    setLikedSongs((prev) => {
      const exists = prev.some((item) => item.youtubeId === song.youtubeId);
      if (exists) return prev.filter((item) => item.youtubeId !== song.youtubeId);
      return [
        {
          youtubeId: song.youtubeId,
          title: song.title,
          artist: song.artist,
          language: song.language,
          genre: song.genre,
          likedAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 100);
    });
  }, []);

  useEffect(() => {
    actionHandlersRef.current = {
      togglePlayPause,
      playNext,
      toggleLikedSong: () => {
        if (currentSongRef.current) toggleLikedSong(currentSongRef.current);
      },
    };
  }, [togglePlayPause, playNext, toggleLikedSong]);

  useEffect(() => {
    const runAction = (actionName) => {
      if (!actionName) return;

      if (actionName === "toggle-play") actionHandlersRef.current.togglePlayPause();
      if (actionName === "next") actionHandlersRef.current.playNext();
      if (actionName === "like") actionHandlersRef.current.toggleLikedSong();
    };

    const handleMiniPlayerAction = (event) => {
      runAction(String(event?.detail?.action || ""));
      try {
        localStorage.removeItem(MINI_PLAYER_ACTION_KEY);
      } catch {
        // no-op
      }
    };

    window.addEventListener(MINI_PLAYER_ACTION_EVENT, handleMiniPlayerAction);

    try {
      const raw = localStorage.getItem(MINI_PLAYER_ACTION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.action) runAction(String(parsed.action));
        localStorage.removeItem(MINI_PLAYER_ACTION_KEY);
      }
    } catch {
      // no-op
    }

    return () => window.removeEventListener(MINI_PLAYER_ACTION_EVENT, handleMiniPlayerAction);
  }, []);

  const formatDuration = useCallback((seconds) => {
    const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${String(mins).padStart(1, "0")}:${String(secs).padStart(2, "0")}`;
  }, []);

  const seekTo = useCallback((seconds) => {
    if (!playerRef.current) return;
    const max = duration > 0 ? duration : seconds;
    const safe = Math.max(0, Math.min(Number(seconds) || 0, max));
    try {
      playerRef.current.seekTo(safe, true);
      setCurrentTime(safe);
      setSeekValue(safe);
    } catch {
      // no-op
    }
  }, [duration]);

  useEffect(() => {
    if (!currentlyPlaying?.youtubeId) return undefined;

    const timer = setInterval(() => {
      if (!playerRef.current || isSeeking) return;
      try {
        const nextTime = Number(playerRef.current.getCurrentTime()) || 0;
        const nextDuration = Number(playerRef.current.getDuration()) || 0;
        setCurrentTime(nextTime);
        if (nextDuration > 0) setDuration(nextDuration);
      } catch {
        // no-op
      }
    }, 500);

    return () => clearInterval(timer);
  }, [currentlyPlaying?.youtubeId, isSeeking]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.defaultPrevented || e.repeat) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const target = e.target;
      const tag = target?.tagName;
      const isTypingTarget =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable;
      if (isTypingTarget) return;

      const key = e.key;
      const code = e.code;

      if (key === " " || key === "Spacebar" || code === "Space") {
        e.preventDefault();
        togglePlayPause();
        return;
      }

      if (key === "ArrowRight") {
        e.preventDefault();
        playNext();
        return;
      }

      if (key === "ArrowLeft") {
        e.preventDefault();
        playPrev();
        return;
      }

      if (key === "Escape" && currentSongRef.current) {
        e.preventDefault();
        closePlayer();
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

  const searchableSongs = useMemo(() => {
    const byId = new Map();

    Object.entries(musicLibrary).forEach(([mood, moodSongs]) => {
      (moodSongs || []).forEach((song) => {
        if (!song?.youtubeId) return;
        const existing = byId.get(song.youtubeId);

        if (existing) {
          if (!existing.moods.includes(mood)) existing.moods.push(mood);
          return;
        }

        byId.set(song.youtubeId, {
          ...song,
          moods: [mood],
          sourceMood: mood,
        });
      });
    });

    return Array.from(byId.values());
  }, []);

  const searchableLanguages = useMemo(() => {
    const langs = Array.from(new Set(searchableSongs.map((song) => song.language).filter(Boolean))).sort();
    return ["Any", ...langs];
  }, [searchableSongs]);

  const preferredGenresForSearch = useMemo(() => {
    const frequency = {};
    likedSongs.forEach((song) => {
      const key = String(song?.genre || "").trim();
      if (!key) return;
      frequency[key] = (frequency[key] || 0) + 1;
    });
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);
  }, [likedSongs]);

  const preferredLanguagesForSearch = useMemo(() => {
    const frequency = {};
    likedSongs.forEach((song) => {
      const key = String(song?.language || "").trim();
      if (!key || key === "Unknown") return;
      frequency[key] = (frequency[key] || 0) + 1;
    });
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([language]) => language);
  }, [likedSongs]);

  const recommendationCards = useMemo(() => {
    const fromInsight = Array.isArray(searchMoodInsight?.videos) ? searchMoodInsight.videos : [];
    if (fromInsight.length) return fromInsight.slice(0, 8);

    return songSearchResults
      .filter((song) => song?.youtubeId)
      .slice(0, 8)
      .map((song) => ({
        title: song.title,
        artist: song.artist,
        thumbnail: song.thumbnail || getYoutubeThumbnail(song.youtubeId) || THUMBNAIL_PLACEHOLDER,
        youtubeId: song.youtubeId,
        url: `https://www.youtube.com/watch?v=${song.youtubeId}`,
      }));
  }, [searchMoodInsight, songSearchResults]);

  const inferMoodFromSong = useCallback((song) => {
    if (song?.detectedMood && musicLibrary[song.detectedMood]) return song.detectedMood;
    if (song?.sourceMood && musicLibrary[song.sourceMood]) return song.sourceMood;

    const firstMood = song?.moods?.find((m) => musicLibrary[m]);
    if (firstMood) return firstMood;

    const energy = String(song?.energy || "").toLowerCase();
    const genre = String(song?.genre || "").toLowerCase();

    if (energy === "high") return "Excited";
    if (energy === "low") return "Calm";
    if (genre.includes("ambient") || genre.includes("instrumental") || genre.includes("lo-fi")) return "Calm";
    if (genre.includes("rock") || genre.includes("hip-hop")) return "Excited";
    return "Happy";
  }, []);

  useEffect(() => {
    const onClickOutside = () => setShowSongSearchResults(false);
    window.addEventListener("click", onClickOutside);
    return () => window.removeEventListener("click", onClickOutside);
  }, []);

  useEffect(() => {
    const query = songSearchQuery.trim().toLowerCase();
    if (!query) {
      setSongSearchResults([]);
      setSongSearchLoading(false);
      setSongSearchNextPageToken("");
      setSongSearchHasMore(false);
      setSearchMoodInsight(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      const cacheKey = `${songSearchLanguage}::${query}`;
      const localMatches = searchableSongs
        .filter((song) => {
          if (songSearchLanguage !== "Any" && song.language !== songSearchLanguage) return false;
          const haystack = `${song.title} ${song.artist} ${song.language || ""}`.toLowerCase();
          return haystack.includes(query);
        })
        .map((song) => ({ ...song, source: "local-library" }));

      const localSorted = Array.from(
        new Map(localMatches.filter((song) => song?.youtubeId).map((song) => [song.youtubeId, song])).values()
      ).sort((a, b) => {
        const aStarts = String(a.title || "").toLowerCase().startsWith(query) ? 1 : 0;
        const bStarts = String(b.title || "").toLowerCase().startsWith(query) ? 1 : 0;
        if (aStarts !== bStarts) return bStarts - aStarts;
        return String(a.title || "").localeCompare(String(b.title || ""));
      });

      if (!cancelled) setSongSearchResults(localSorted);

      const cached = searchCacheRef.current.get(cacheKey);
      if (cached && !cancelled) {
        setSongSearchResults(cached.results || localSorted);
        setSongSearchNextPageToken(cached.nextPageToken || "");
        setSongSearchHasMore(Boolean(cached.nextPageToken));
        setSearchMoodInsight(cached.insight || null);
        return;
      }

      try {
        setSongSearchLoading(true);

        let youtubeMatches = [];
        let nextPageToken = "";
        let detectedInsight = null;
        try {
          const { data } = await axiosInstance.get("/api/music-intel/search", {
            params: {
              q: songSearchQuery.trim(),
              language: songSearchLanguage,
              maxResults: 20,
              preferredGenres: preferredGenresForSearch.join(","),
              preferredLanguages: preferredLanguagesForSearch.join(","),
            },
            timeout: 4500,
          });
          if (data?.success && Array.isArray(data.results)) {
            youtubeMatches = Array.isArray(data.videos) && data.videos.length ? data.videos : data.results;
            nextPageToken = data.nextPageToken || "";
            detectedInsight = {
              mood: data.mood || "neutral",
              confidence: Number(data.confidence || 0.55),
              message: data.message || "Your mood appears balanced. Here are some songs to explore.",
              videos: Array.isArray(data.videos) ? data.videos : [],
            };
          }
        } catch {
          // fallback to local library search if online provider fails
          detectedInsight = {
            mood: "neutral",
            confidence: 0.5,
            message: "Your request was not fully clear, so here are versatile tracks to explore.",
            videos: [],
          };
        }

        if (cancelled) return;

        const baseResults = youtubeMatches.length ? [...youtubeMatches, ...localSorted] : localSorted;

        const merged = Array.from(
          new Map(baseResults.filter((song) => song?.youtubeId).map((song) => [song.youtubeId, song])).values()
        )
          .sort((a, b) => {
            const aStarts = String(a.title || "").toLowerCase().startsWith(query) ? 1 : 0;
            const bStarts = String(b.title || "").toLowerCase().startsWith(query) ? 1 : 0;
            if (aStarts !== bStarts) return bStarts - aStarts;
            return String(a.title || "").localeCompare(String(b.title || ""));
          });

        setSongSearchResults(merged);
        setSongSearchNextPageToken(nextPageToken);
        setSongSearchHasMore(Boolean(nextPageToken) && youtubeMatches.length > 0);
        setSearchMoodInsight(detectedInsight);
        searchCacheRef.current.set(cacheKey, {
          results: merged,
          nextPageToken,
          insight: {
            mood: detectedInsight?.mood || "neutral",
            confidence: Number(detectedInsight?.confidence || 0.55),
            message: detectedInsight?.message || "Your mood appears balanced. Here are some songs to explore.",
            videos: Array.isArray(detectedInsight?.videos) ? detectedInsight.videos : [],
          },
          createdAt: Date.now(),
        });
      } finally {
        if (!cancelled) setSongSearchLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    songSearchQuery,
    songSearchLanguage,
    searchableSongs,
    preferredGenresForSearch,
    preferredLanguagesForSearch,
  ]);

  const loadMoreSearchResults = useCallback(async () => {
    if (!songSearchNextPageToken || songSearchLoadingMore || !songSearchQuery.trim()) return;

    try {
      setSongSearchLoadingMore(true);
      const { data } = await axiosInstance.get("/api/music-intel/search", {
        params: {
          q: songSearchQuery.trim(),
          language: songSearchLanguage,
          maxResults: 50,
          pageToken: songSearchNextPageToken,
        },
        timeout: 8000,
      });

      if (!(data?.success && Array.isArray(data.results))) {
        setSongSearchHasMore(false);
        return;
      }

      const nextToken = data.nextPageToken || "";
      const incoming = data.results;

      setSongSearchResults((prev) => {
        const dedup = new Map();
        [...prev, ...incoming].forEach((song) => {
          if (!song?.youtubeId) return;
          if (!dedup.has(song.youtubeId)) dedup.set(song.youtubeId, song);
        });
        return Array.from(dedup.values());
      });

      setSongSearchNextPageToken(nextToken);
      setSongSearchHasMore(Boolean(nextToken));
    } catch {
      // Keep current results visible; only disable load-more on repeated provider failures.
      setSongSearchHasMore(false);
    } finally {
      setSongSearchLoadingMore(false);
    }
  }, [songSearchNextPageToken, songSearchLoadingMore, songSearchQuery, songSearchLanguage]);

  const buildPlaylistForMood = useCallback((mood, blockedIds = unavailableSetRef.current, targetSize = 8) => {
    const isAllowed = (song) => song?.youtubeId && !blockedIds.has(song.youtubeId);
    const moodPool = (musicLibrary[mood] || musicLibrary.Happy).filter(isAllowed);
    const basePool = getPlaylist(mood).filter(isAllowed);

    const dedup = new Map();
    [...basePool, ...moodPool].forEach((song) => {
      if (!dedup.has(song.youtubeId)) dedup.set(song.youtubeId, song);
    });
    const mergedPool = Array.from(dedup.values());

    const english = mergedPool.filter((song) => song.language === "English");
    const hindi = mergedPool.filter((song) => song.language === "Hindi");
    const southIndian = mergedPool.filter((song) => song.language === "Tamil" || song.language === "Telugu");
    const instrumental = mergedPool.filter((song) => song.language === "Instrumental");

    const selected = [];
    const usedIds = new Set();
    const takeFromPool = (pool, count) => {
      if (count <= 0 || !pool.length) return;
      const shuffled = shuffleArray(pool);
      let remaining = count;
      for (const song of shuffled) {
        if (usedIds.has(song.youtubeId)) continue;
        selected.push(song);
        usedIds.add(song.youtubeId);
        remaining -= 1;
        if (remaining <= 0) break;
      }
    };

    const desiredSize = Math.max(targetSize, 6);
    if (desiredSize >= 8) {
      takeFromPool(english, 2);
      takeFromPool(hindi, 2);
      takeFromPool(southIndian, 2);
      takeFromPool(instrumental, 1);
    } else {
      takeFromPool(english, 2);
      takeFromPool(hindi, 1);
      takeFromPool(southIndian, 1);
      takeFromPool(instrumental, 1);
    }

    for (const song of shuffleArray(mergedPool)) {
      if (selected.length >= desiredSize) break;
      if (usedIds.has(song.youtubeId)) continue;
      selected.push(song);
      usedIds.add(song.youtubeId);
    }

    if (selected.length < desiredSize) {
      const crossMoodPool = shuffleArray(
        Object.values(musicLibrary)
          .flat()
          .filter(isAllowed)
      );
      for (const song of crossMoodPool) {
        if (selected.length >= desiredSize) break;
        if (usedIds.has(song.youtubeId)) continue;
        selected.push(song);
        usedIds.add(song.youtubeId);
      }
    }

    return shuffleArray(selected).slice(0, desiredSize);
  }, []);

  const fetchMoodAndMusic = async () => {
    try {
      const blocked = unavailableSetRef.current;
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

      const nextSongs = buildPlaylistForMood(mood, blocked, 8);
      setSongs(nextSongs);
      const quotes = motivationalQuotes[mood] || motivationalQuotes.Happy;
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    } catch {
      setCurrentMood("Happy");
      const blocked = unavailableSetRef.current;
      setSongs(buildPlaylistForMood("Happy", blocked, 8));
      setCurrentQuote(motivationalQuotes.Happy[0]);
    } finally {
      setLoading(false);
    }
  };

  const playSong = useCallback((song) => {
    setCurrentlyPlaying(song);
    setIsPlaying(true);
  }, []);

  const playSongFromSearch = useCallback((song) => {
    if (!song?.youtubeId) return;

    const detectedMood = inferMoodFromSong(song);
    if (detectedMood && musicLibrary[detectedMood]) {
      setCurrentMood(detectedMood);
      localStorage.setItem("detected_mood", detectedMood.toLowerCase());

      const quotes = motivationalQuotes[detectedMood] || motivationalQuotes.Happy;
      if (quotes?.length) setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);

      const blocked = unavailableSetRef.current;
      const refreshed = buildPlaylistForMood(detectedMood, blocked, Math.max(songsRef.current.length || 8, 8));
      const deduped = [song, ...refreshed.filter((item) => item.youtubeId !== song.youtubeId)];
      setSongs(deduped.slice(0, Math.max(8, deduped.length)));

      setPlaylistNotice(`Detected mood from song: ${detectedMood}. Playing your selected track.`);
    }

    setSongSearchQuery("");
    setShowSongSearchResults(false);
    playSong(song);
  }, [buildPlaylistForMood, inferMoodFromSong, playSong]);

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
    if (!currentMood || !musicLibrary[currentMood]) return;
    const blocked = unavailableSetRef.current;
    const nextSongs = buildPlaylistForMood(currentMood, blocked, songsRef.current.length || 8);
    setSongs(nextSongs);
    setPlaylistNotice("Playlist refreshed with available tracks.");
  };

  const replaceBrokenSongs = () => {
    if (!currentMood || !musicLibrary[currentMood]) return;

    const replacedCount = unavailableTrackIds.length;
    saveUnavailableTrackIds([]);
    setUnavailableTrackIds([]);
    unavailableSetRef.current = new Set();

    const nextSongs = buildPlaylistForMood(currentMood, new Set(), songsRef.current.length || 8);
    setSongs(nextSongs);

    const currentTrackId = currentSongRef.current?.youtubeId;
    const currentTrackStillPresent = nextSongs.find((song) => song.youtubeId === currentTrackId);
    if (!currentTrackStillPresent && currentSongRef.current) {
      setCurrentlyPlaying(nextSongs[0] || null);
      if (nextSongs.length === 0) setIsPlaying(false);
    }

    setPlaylistNotice(
      replacedCount > 0
        ? `Replaced ${replacedCount} unavailable track${replacedCount > 1 ? "s" : ""} with multilingual fresh picks.`
        : "No blocked tracks found. Refreshed with multilingual fresh picks."
    );
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
      <div className={`relative z-10 pt-14 lg:pt-4 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto ${currentlyPlaying ? "pb-36" : "pb-12"}`}>

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
              className="relative bg-neutral-900/60 backdrop-blur-sm border border-neutral-800/80 rounded-2xl p-6 md:p-8 mb-6 overflow-visible"
              aria-label="Music player hero"
            >
              <div className="pointer-events-none absolute inset-x-0 -top-8 -z-10 flex justify-center">
                <div className="h-40 w-[92%] rounded-full bg-gradient-to-r from-indigo-500/14 via-sky-500/10 to-emerald-500/14 blur-3xl" />
              </div>

              {playlistNotice && (
                <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                  {playlistNotice}
                </div>
              )}

              {/* Mood indicator — subtle chip */}
              <div className="flex flex-col gap-5 md:gap-6 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${accent.dot}`} />
                    <span className={`text-xs font-semibold tracking-wider uppercase ${accent.text}`}>
                      {currentMood} Mood
                    </span>
                    <span className="text-[11px] text-neutral-500">Adaptive playlist session</span>
                  </div>
                  <button
                    onClick={() => navigate("/mood-detect")}
                    className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    Change mood
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <HeroMetric label="Tracks" value={String(songs.length)} />
                  <HeroMetric label="Liked" value={String(likedSongs.length)} />
                  <HeroMetric label="History" value={String(listenHistory.length)} />
                  <HeroMetric label="Repeat" value={repeatMode === "off" ? "Off" : repeatMode === "all" ? "All" : "One"} />
                </div>
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

              <div className="mb-6 relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <input
                      value={songSearchQuery}
                      onChange={(e) => {
                        setSongSearchQuery(e.target.value);
                        setShowSongSearchResults(true);
                      }}
                      onFocus={() => setShowSongSearchResults(true)}
                      placeholder="Search by song, artist, or vibe"
                      className="w-full bg-neutral-900/80 border border-neutral-700/60 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  <select
                    value={songSearchLanguage}
                    onChange={(e) => setSongSearchLanguage(e.target.value)}
                    className="bg-neutral-900/80 border border-neutral-700/60 rounded-xl px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {searchableLanguages.map((language) => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </div>

                <AnimatePresence>
                  {showSongSearchResults && songSearchQuery.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 bg-neutral-950/95 border border-neutral-700/70 rounded-xl shadow-xl overflow-hidden"
                    >
                      <div className="max-h-72 overflow-y-auto custom-scrollbar">
                        {!!songSearchResults.length && !songSearchLoading && (
                          <p className="px-4 py-2 text-[11px] text-neutral-500 border-b border-neutral-800/60">
                            Showing {songSearchResults.length} results{songSearchHasMore ? " (load more available)" : ""}
                          </p>
                        )}
                        {songSearchLoading && (
                          <p className="px-4 py-3 text-xs text-neutral-500">Searching songs...</p>
                        )}
                        {!songSearchLoading && songSearchResults.length ? songSearchResults.map((song) => (
                          <button
                            key={`search-${song.youtubeId}`}
                            onClick={() => playSongFromSearch(song)}
                            className="w-full px-4 py-3 text-left border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/70 transition-colors"
                          >
                            <p className="text-sm text-neutral-100 truncate">{song.title}</p>
                            <p className="text-[11px] text-neutral-500 truncate">
                              {song.artist} • {song.language || "Unknown"} • Mood signal: {song.sourceMood || song.detectedMood || "Neutral"} • {song.source === "youtube-search" ? "Online" : "Library"}
                            </p>
                          </button>
                        )) : (
                          !songSearchLoading && <p className="px-4 py-3 text-xs text-neutral-500">No songs found. Try another title, artist, or language.</p>
                        )}

                        {!songSearchLoading && songSearchHasMore && (
                          <div className="px-3 py-2 border-t border-neutral-800/60">
                            <button
                              onClick={loadMoreSearchResults}
                              disabled={songSearchLoadingMore}
                              className="w-full px-3 py-2 rounded-lg text-xs bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-200 transition-colors disabled:opacity-60"
                            >
                              {songSearchLoadingMore ? "Loading more songs..." : "Load More Songs"}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {songSearchQuery.trim() && (songSearchLoading || searchMoodInsight || recommendationCards.length > 0) && (
                <div className="mb-6 rounded-xl border border-neutral-800/70 bg-neutral-950/60 p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Search Insight</p>
                      <p className="text-sm font-semibold text-neutral-100">
                        {searchMoodInsight?.mood ? String(searchMoodInsight.mood).charAt(0).toUpperCase() + String(searchMoodInsight.mood).slice(1) : "Neutral"}
                        {Number.isFinite(Number(searchMoodInsight?.confidence)) ? ` (${Math.round(Number(searchMoodInsight.confidence) * 100)}%)` : ""}
                      </p>
                    </div>
                    <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
                      {songSearchLoading
                        ? "Analyzing intent and preparing recommendations..."
                        : searchMoodInsight?.message || "Your mood appears balanced. Here are some songs to explore."}
                    </p>
                  </div>

                  {!songSearchLoading && recommendationCards.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {recommendationCards.map((song) => (
                        <button
                          key={`rec-${song.youtubeId}`}
                          type="button"
                          onClick={() => playSongFromSearch(song)}
                          className="group text-left rounded-xl overflow-hidden border border-neutral-800/80 bg-neutral-900/60 hover:bg-neutral-800/70 transition-colors"
                        >
                          <img
                            src={song.thumbnail || THUMBNAIL_PLACEHOLDER}
                            alt={song.title || "Recommended track"}
                            className="w-full h-28 object-cover"
                            loading="lazy"
                            onError={(e) => { e.target.src = THUMBNAIL_PLACEHOLDER; }}
                          />
                          <div className="p-3">
                            <p className="text-sm text-neutral-100 font-medium truncate">{song.title}</p>
                            <p className="text-xs text-neutral-500 truncate">{song.artist || "Unknown Artist"}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Primary Music Controls — dominant, clear */}
              <div className="flex flex-wrap items-center gap-2.5">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => playSong(songs[0])}
                  className="px-6 py-2.5 bg-slate-200 hover:bg-slate-100 text-slate-900 font-semibold rounded-full text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 border border-slate-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/70"
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
                  onClick={replaceBrokenSongs}
                  className="px-5 py-2.5 bg-emerald-900/30 hover:bg-emerald-800/30 border border-emerald-600/30 text-emerald-300 text-sm font-medium rounded-full transition-all flex items-center gap-2"
                  title="Clear blocked songs and replace with fresh picks"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h5l2-2h4l2 2h5M7 7v10a2 2 0 002 2h6a2 2 0 002-2V7m-7 4v4m4-4v4" />
                  </svg>
                  Replace Broken Songs{unavailableTrackIds.length > 0 ? ` (${unavailableTrackIds.length})` : ""}
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
                                ? "bg-slate-200/10"
                                : "hover:bg-slate-200/5"
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLikedSong(song);
                              }}
                              className={`p-1.5 rounded-md transition-colors ${isSongLiked(song) ? "text-rose-400" : "text-neutral-600 hover:text-rose-300"}`}
                              aria-label={isSongLiked(song) ? "Unlike song" : "Like song"}
                              title={isSongLiked(song) ? "Unlike" : "Like"}
                            >
                              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                              </svg>
                            </button>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              song.language === "Hindi" ? "bg-rose-500/10 text-rose-400/70"
                                : song.language === "Tamil" ? "bg-amber-500/10 text-amber-400/70"
                                : song.language === "Telugu" ? "bg-purple-500/10 text-purple-400/70"
                                : song.language === "Instrumental" ? "bg-cyan-500/10 text-cyan-400/70"
                                : "bg-teal-500/10 text-teal-400/70"
                            }`}>
                              {song.language === "Hindi" ? "HI" : song.language === "Tamil" ? "TA" : song.language === "Telugu" ? "TE" : song.language === "Instrumental" ? "🎵" : "EN"}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mb-6"
              aria-label="Music library"
            >
              <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/80 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowLibrary((prev) => !prev)}
                  className="w-full px-6 py-4 border-b border-neutral-800/60 flex items-center justify-between hover:bg-neutral-800/30 transition-colors"
                >
                  <div className="text-left">
                    <h3 className="text-base font-semibold text-neutral-200">Liked Songs & History</h3>
                    <p className="text-xs text-neutral-500">{likedSongs.length} liked • {listenHistory.length} recently played</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-neutral-500 transition-transform ${showLibrary ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showLibrary && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        <div className="p-4 border-b lg:border-b-0 lg:border-r border-neutral-800/60">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-rose-300">Liked Songs</h4>
                            <span className="text-[11px] text-neutral-500">{likedSongs.length}</span>
                          </div>
                          <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1.5">
                            {likedSongs.length ? likedSongs.map((song) => (
                              <div key={`liked-${song.youtubeId}`} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-neutral-800/60 transition-colors">
                                <button onClick={() => playSong(song)} className="flex-1 min-w-0 text-left">
                                  <p className="text-sm text-neutral-200 truncate">{song.title}</p>
                                  <p className="text-[11px] text-neutral-500 truncate">{song.artist}</p>
                                </button>
                                <button
                                  onClick={() => toggleLikedSong(song)}
                                  className="p-1.5 text-rose-400 hover:text-rose-300"
                                  aria-label="Remove liked song"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                  </svg>
                                </button>
                              </div>
                            )) : (
                              <p className="text-xs text-neutral-500">No liked songs yet. Tap the heart icon on any track.</p>
                            )}
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-indigo-300">Listening History</h4>
                            <button
                              onClick={() => setListenHistory([])}
                              className="text-[11px] text-neutral-500 hover:text-neutral-300"
                            >
                              Clear
                            </button>
                          </div>
                          <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1.5">
                            {listenHistory.length ? listenHistory.map((entry) => (
                              <button
                                key={`history-${entry.youtubeId}-${entry.playedAt}`}
                                onClick={() => playSong(entry)}
                                className="w-full text-left rounded-lg px-2 py-2 hover:bg-neutral-800/60 transition-colors"
                              >
                                <p className="text-sm text-neutral-200 truncate">{entry.title}</p>
                                <p className="text-[11px] text-neutral-500 truncate">
                                  {entry.artist} • {new Date(entry.playedAt).toLocaleString()}
                                </p>
                              </button>
                            )) : (
                              <p className="text-xs text-neutral-500">No history yet. Played tracks will appear here automatically.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>

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
              <MusicIntelligencePanel
                currentMood={currentMood}
                currentlyPlaying={currentlyPlaying}
                onPlaySong={playSong}
              />

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

                <button
                  onClick={() => toggleLikedSong(currentlyPlaying)}
                  className={`p-2 transition-colors ${isSongLiked(currentlyPlaying) ? "text-rose-400" : "text-neutral-600 hover:text-rose-300"}`}
                  aria-label={isSongLiked(currentlyPlaying) ? "Unlike current song" : "Like current song"}
                  title={isSongLiked(currentlyPlaying) ? "Unlike" : "Like"}
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                </button>

                {/* Controls — high contrast, clear */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button onClick={playPrev} className="p-2 text-neutral-500 hover:text-white transition-colors" aria-label="Previous">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                    </svg>
                  </button>
                  <button
                    onClick={togglePlayPause}
                    className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md"
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

              <div className="mt-2 flex items-center gap-3">
                <span className="text-[10px] text-neutral-500 w-9 text-right">{formatDuration(isSeeking ? seekValue : currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(1, Math.floor(duration || 0))}
                  step={1}
                  value={Math.min(isSeeking ? seekValue : currentTime, Math.max(1, Math.floor(duration || 0)))}
                  onMouseDown={() => setIsSeeking(true)}
                  onTouchStart={() => setIsSeeking(true)}
                  onChange={(e) => setSeekValue(Number(e.target.value) || 0)}
                  onMouseUp={() => { setIsSeeking(false); seekTo(seekValue); }}
                  onTouchEnd={() => { setIsSeeking(false); seekTo(seekValue); }}
                  onKeyUp={() => seekTo(seekValue)}
                  className="flex-1 h-1.5 accent-indigo-400 bg-neutral-800 rounded-lg cursor-pointer"
                  aria-label="Seek playback"
                />
                <span className="text-[10px] text-neutral-500 w-9">{formatDuration(duration)}</span>
              </div>
            </div>
            <div className="sr-only" aria-hidden="true"><div id="yt-player-container" /></div>
          </motion.div>
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

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-neutral-700/80 bg-neutral-900/70 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="text-sm font-semibold text-neutral-100 truncate">{value}</p>
    </div>
  );
}

export default Music;
