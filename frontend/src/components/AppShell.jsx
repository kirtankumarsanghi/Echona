import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout, getCurrentUser } from "../utils/auth";
import Logo from "./Logo";

const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  MoodDetect: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Music: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  Todo: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

const MINI_PLAYER_STATE_KEY = "echona_mini_player_state";
const MINI_PLAYER_ACTION_KEY = "echona_mini_player_action";
const MINI_PLAYER_UPDATE_EVENT = "echona-mini-player-updated";
const MINI_PLAYER_ACTION_EVENT = "echona-mini-player-action";

const moodGlowStyles = {
  Happy: "shadow-[0_0_22px_rgba(251,191,36,0.32)] border-amber-400/35",
  Sad: "shadow-[0_0_22px_rgba(96,165,250,0.3)] border-blue-400/35",
  Angry: "shadow-[0_0_22px_rgba(244,63,94,0.3)] border-rose-400/35",
  Anxious: "shadow-[0_0_22px_rgba(168,85,247,0.3)] border-purple-400/35",
  Calm: "shadow-[0_0_22px_rgba(52,211,153,0.3)] border-emerald-400/35",
  Excited: "shadow-[0_0_22px_rgba(244,114,182,0.3)] border-pink-400/35",
  Stressed: "shadow-[0_0_22px_rgba(248,113,113,0.3)] border-red-400/35",
  Lonely: "shadow-[0_0_22px_rgba(148,163,184,0.3)] border-slate-400/35",
  Tired: "shadow-[0_0_22px_rgba(129,140,248,0.3)] border-indigo-400/35",
  Neutral: "shadow-[0_0_18px_rgba(148,163,184,0.22)] border-slate-500/30",
};

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

function formatMiniTime(seconds) {
  const value = Math.max(0, Math.floor(Number(seconds) || 0));
  const mins = Math.floor(value / 60);
  const secs = value % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getCurrentUser();
  const [miniPlayer, setMiniPlayer] = useState(() => readMiniPlayerState());

  // #16 — Persist sidebar collapsed state on desktop
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("echona_sidebar_collapsed") === "true"; } catch { return false; }
  });
  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      localStorage.setItem("echona_sidebar_collapsed", String(!prev));
      return !prev;
    });
  }, []);

  // #16 — Swipe-to-open on mobile (touch gestures)
  const touchRef = useRef({ startX: 0, startY: 0 });
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchRef.current.startX = e.touches[0].clientX;
      touchRef.current.startY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - touchRef.current.startX;
      const dy = Math.abs(e.changedTouches[0].clientY - touchRef.current.startY);
      // Swipe right from left edge → open; swipe left → close
      if (dx > 80 && dy < 40 && touchRef.current.startX < 30) setSidebarOpen(true);
      if (dx < -80 && dy < 40 && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [sidebarOpen]);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Icons.Dashboard },
    { path: "/mood-detect", label: "Detect Mood", icon: Icons.MoodDetect },
    { path: "/music", label: "Music", icon: Icons.Music },
    { path: "/todo", label: "Planner", icon: Icons.Todo },
  ];

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

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

  const triggerMiniPlayerAction = useCallback(
    (action) => {
      const payload = { action, issuedAt: Date.now() };

      try {
        localStorage.setItem(MINI_PLAYER_ACTION_KEY, JSON.stringify(payload));
      } catch {
        // no-op
      }

      window.dispatchEvent(new CustomEvent(MINI_PLAYER_ACTION_EVENT, { detail: payload }));

      if (location.pathname !== "/music") {
        navigate("/music");
      }
    },
    [location.pathname, navigate]
  );

  const miniMood = miniPlayer?.mood || "Neutral";
  const miniGlowClass = moodGlowStyles[miniMood] || moodGlowStyles.Neutral;
  const miniProgress =
    miniPlayer?.duration > 0
      ? Math.max(0, Math.min(100, (Number(miniPlayer.currentTime || 0) / Number(miniPlayer.duration)) * 100))
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — fixed on all breakpoints, CSS transition for mobile slide */}
      <aside
        className={`fixed top-0 left-0 h-screen ${collapsed ? "w-[4.75rem]" : "w-64"} bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/90 flex flex-col z-50 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        aria-label="Main navigation"
      >
        <div className="p-4 border-b border-slate-800/90">
          <div className="flex items-center justify-between">
            {!collapsed && <Logo size="default" showText={true} />}
            {collapsed && <Logo size="small" showText={false} />}
            {/* Collapse toggle for desktop */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors" aria-label="Close menu">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className={`flex-1 ${collapsed ? "px-3 py-5" : "p-4"} space-y-2 overflow-y-auto`} role="navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center ${collapsed ? "justify-center" : ""} gap-3 ${collapsed ? "px-2 py-1.5 rounded-full" : "px-3 py-2.5 rounded-2xl"} transition-all duration-200 ${
                  isActive
                    ? `${collapsed ? "bg-gradient-to-b from-primary-500/28 to-primary-600/14 border border-primary-300/45 shadow-[0_12px_26px_rgba(37,99,235,0.26)] ring-1 ring-primary-300/20" : "bg-primary-500/16 border border-primary-500/35 shadow-[0_8px_20px_rgba(37,99,235,0.22)]"} text-primary-100`
                    : "text-slate-300 hover:text-slate-100 border border-transparent hover:bg-slate-800/75"
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-11 w-11 items-center justify-center ${collapsed ? "rounded-full" : "rounded-xl"} transition-colors ${isActive ? "bg-gradient-to-b from-primary-300/20 to-primary-500/25 text-primary-100 shadow-inner shadow-primary-200/10" : "bg-slate-800/70 text-slate-300 group-hover:text-slate-100"}`}>
                    <item.icon />
                  </span>
                  {!collapsed && <span className="text-sm font-medium tracking-wide">{item.label}</span>}
                  {collapsed && (
                    <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 shadow-xl group-hover:lg:block">
                      {item.label}
                    </span>
                  )}
                  {collapsed && isActive && <span className="absolute right-1 h-1.5 w-1.5 rounded-full bg-primary-300" />}
                </>
              )}
            </NavLink>
          ))}

          {miniPlayer?.song?.youtubeId && !collapsed && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 rounded-2xl border bg-slate-900/80 backdrop-blur-sm p-3 ${miniGlowClass}`}
              aria-label="Mini music player"
            >
              <button
                onClick={() => navigate("/music")}
                className="w-full text-left"
                aria-label="Open full music page"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-1">Now Playing</p>
                <p className="text-xs font-semibold text-slate-100 truncate">{miniPlayer.song.title || "Unknown track"}</p>
                <p className="text-[11px] text-slate-400 truncate">{miniPlayer.song.artist || "Unknown artist"}</p>
              </button>

              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-300 transition-all duration-300"
                  style={{ width: `${miniProgress}%` }}
                />
              </div>

              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>{formatMiniTime(miniPlayer.currentTime)}</span>
                <span>{formatMiniTime(miniPlayer.duration)}</span>
              </div>

              <div className="mt-2 flex items-center gap-1.5">
                <button
                  onClick={() => triggerMiniPlayerAction("toggle-play")}
                  className="flex-1 px-2 py-1.5 rounded-lg border border-slate-700 bg-slate-800/90 text-slate-200 hover:bg-slate-700 transition-colors"
                  aria-label={miniPlayer.isPlaying ? "Pause" : "Play"}
                >
                  {miniPlayer.isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  onClick={() => triggerMiniPlayerAction("next")}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/90 text-slate-300 hover:bg-slate-700 transition-colors"
                  aria-label="Next song"
                >
                  Next
                </button>
                <button
                  onClick={() => triggerMiniPlayerAction("like")}
                  className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
                    miniPlayer.song.isLiked
                      ? "border-rose-400/50 bg-rose-500/15 text-rose-300"
                      : "border-slate-700 bg-slate-800/90 text-slate-300 hover:bg-slate-700"
                  }`}
                  aria-label={miniPlayer.song.isLiked ? "Unlike song" : "Like song"}
                >
                  {miniPlayer.song.isLiked ? "Liked" : "Like"}
                </button>
              </div>

              <button
                onClick={() => navigate("/music")}
                className="mt-2 w-full px-2 py-1.5 text-[11px] rounded-lg border border-primary-400/35 text-primary-200 bg-primary-500/10 hover:bg-primary-500/20 transition-colors"
              >
                Open Full Music
              </button>
            </motion.section>
          )}

          {miniPlayer?.song?.youtubeId && collapsed && (
            <button
              onClick={() => navigate("/music")}
              className="w-full mt-4 h-11 rounded-full border border-primary-400/35 bg-primary-500/15 text-primary-100 hover:bg-primary-500/25 transition-colors text-xs"
              title="Open full music"
              aria-label="Open full music"
            >
              Music
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          {user && !collapsed && (
            <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center font-bold text-white flex-shrink-0">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{user.name || "User"}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email || ""}</p>
                </div>
              </div>
            </div>
          )}
          {user && collapsed && (
            <div className="flex justify-center mb-2">
              <div className="w-11 h-11 rounded-full bg-primary-700 flex items-center justify-center font-bold text-white shadow-[0_8px_20px_rgba(59,130,246,0.3)]" title={user.name || "User"}>
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
            </div>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              title={collapsed ? "Logout" : undefined}
              className={`flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-3 py-2.5 rounded-lg w-full text-red-300 hover:bg-red-500/15 transition-colors duration-200`}
              aria-label="Logout"
            >
              <Icons.Logout />
              {!collapsed && <span>Logout</span>}
            </button>
          ) : (
            <NavLink
              to="/auth"
              title={collapsed ? "Sign In" : undefined}
              className={`flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-3 py-2.5 rounded-lg w-full text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icons.Dashboard />
              {!collapsed && <span>Sign In</span>}
            </NavLink>
          )}
        </div>
      </aside>

      {/* Main content area — offset by sidebar width on desktop */}
      <div className={`${collapsed ? "lg:ml-[4.75rem]" : "lg:ml-64"} min-h-screen transition-all duration-300`}>
        {/* Mobile top bar with hamburger menu */}
        <div className="lg:hidden sticky top-0 z-30 p-4 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Menu
            </button>
            <Logo size="small" showText={true} />
          </div>
        </div>

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
