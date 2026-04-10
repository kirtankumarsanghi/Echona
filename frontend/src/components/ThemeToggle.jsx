import { useEffect, useState } from "react";
import { DARK, LIGHT, resolveTheme, setTheme } from "../utils/theme";

function ThemeToggle({ className = "", compact = false }) {
  const [theme, setCurrentTheme] = useState(() => resolveTheme());

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === "theme") {
        setCurrentTheme(resolveTheme());
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isLight = theme === LIGHT;

  const handleToggle = () => {
    const next = isLight ? DARK : LIGHT;
    setTheme(next);
    setCurrentTheme(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className={`theme-toggle ${compact ? "theme-toggle-compact" : ""} ${className}`.trim()}
    >
      {isLight ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
      <span className="theme-toggle-label">{isLight ? "Dark" : "Light"}</span>
    </button>
  );
}

export default ThemeToggle;
