const THEME_KEY = "theme";
const DARK = "dark";
const LIGHT = "light";

export function getSystemTheme() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return DARK;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? LIGHT : DARK;
}

export function getStoredTheme() {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(THEME_KEY);
  return stored === LIGHT || stored === DARK ? stored : null;
}

export function resolveTheme() {
  return getStoredTheme() || getSystemTheme();
}

export function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const resolved = theme === LIGHT ? LIGHT : DARK;
  const html = document.documentElement;

  html.setAttribute("data-theme", resolved);
  html.classList.remove(DARK, LIGHT);
  html.classList.add(resolved);
}

export function initializeTheme() {
  const theme = resolveTheme();
  applyTheme(theme);
  return theme;
}

export function setTheme(theme) {
  const resolved = theme === LIGHT ? LIGHT : DARK;
  if (typeof window !== "undefined") {
    localStorage.setItem(THEME_KEY, resolved);
  }
  applyTheme(resolved);
  return resolved;
}

export function toggleTheme() {
  const next = resolveTheme() === LIGHT ? DARK : LIGHT;
  return setTheme(next);
}

export { THEME_KEY, DARK, LIGHT };
