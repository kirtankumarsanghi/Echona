import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
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

function AppShell({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getCurrentUser();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-neutral-100">
      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — fixed on all breakpoints, CSS transition for mobile slide */}
      <aside
        className={`fixed top-0 left-0 h-screen ${collapsed ? "w-20" : "w-64"} bg-neutral-900/80 backdrop-blur-xl border-r border-neutral-800 flex flex-col z-50 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        aria-label="Main navigation"
      >
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            {!collapsed && <Logo size="default" showText={true} />}
            {collapsed && <Logo size="small" showText={false} />}
            {/* Collapse toggle for desktop */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-2 rounded-xl hover:bg-neutral-800/50 transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-xl hover:bg-neutral-800/50 transition-colors" aria-label="Close menu">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto" role="navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-600/20 to-primary-500/10 text-white border-l-4 border-primary-500"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-800 space-y-2">
          {user && !collapsed && (
            <div className="p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center font-bold text-white flex-shrink-0">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-100 truncate">{user.name || "User"}</p>
                  <p className="text-xs text-neutral-500 truncate">{user.email || ""}</p>
                </div>
              </div>
            </div>
          )}
          {user && collapsed && (
            <div className="flex justify-center mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center font-bold text-white" title={user.name || "User"}>
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
            </div>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              title={collapsed ? "Logout" : undefined}
              className={`flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-4 py-3 rounded-xl w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300`}
              aria-label="Logout"
            >
              <Icons.Logout />
              {!collapsed && <span>Logout</span>}
            </button>
          ) : (
            <NavLink
              to="/auth"
              title={collapsed ? "Sign In" : undefined}
              className={`flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-4 py-3 rounded-xl w-full text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-all`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icons.Dashboard />
              {!collapsed && <span>Sign In</span>}
            </NavLink>
          )}
        </div>
      </aside>

      {/* Main content area — offset by sidebar width on desktop */}
      <div className={`${collapsed ? "lg:ml-20" : "lg:ml-64"} min-h-screen transition-all duration-300`}>
        {/* Mobile top bar with hamburger menu */}
        <div className="lg:hidden sticky top-0 z-30 p-4 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800/60 border border-neutral-700 rounded-xl text-sm text-neutral-200 hover:bg-neutral-700/60 transition-colors"
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
