import { createContext, useContext, useEffect, useState } from "react";

/* ── Accent palette ─────────────────────────────────────────────── */
export const ACCENTS = {
  blue:   { key: "blue",   hex: "#2563eb", dark: "#1d4ed8", light: "#eff6ff", shadow: "rgba(37,99,235,0.22)"  },
  green:  { key: "green",  hex: "#10b981", dark: "#059669", light: "#ecfdf5", shadow: "rgba(16,185,129,0.22)" },
  amber:  { key: "amber",  hex: "#f59e0b", dark: "#d97706", light: "#fffbeb", shadow: "rgba(245,158,11,0.22)" },
  purple: { key: "purple", hex: "#8b5cf6", dark: "#7c3aed", light: "#f5f3ff", shadow: "rgba(139,92,246,0.22)" },
  red:    { key: "red",    hex: "#ef4444", dark: "#dc2626", light: "#fff1f2", shadow: "rgba(239,68,68,0.22)"  },
};

const ThemeContext = createContext({
  theme: "light", isDark: false,
  accentKey: "blue", accent: ACCENTS.blue,
  setTheme: () => {}, setAccentKey: () => {},
});

export function ThemeProvider({ children }) {
  const [theme,     setThemeState]  = useState(() => localStorage.getItem("mm_theme")  || "light");
  const [accentKey, setAccentState] = useState(() => localStorage.getItem("mm_accent") || "blue");

  const isDark = theme === "dark";
  const accent = ACCENTS[accentKey] ?? ACCENTS.blue;

  const setTheme     = (t) => setThemeState(t);
  const setAccentKey = (k) => setAccentState(k);

  /* Inject CSS variables + data-theme attribute on every change */
  useEffect(() => {
    localStorage.setItem("mm_theme",  theme);
    localStorage.setItem("mm_accent", accentKey);

    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.setProperty("--accent",        accent.hex);
    root.style.setProperty("--accent-dark",   accent.dark);
    root.style.setProperty("--accent-light",  accent.light);
    root.style.setProperty("--accent-shadow", accent.shadow);
  }, [theme, accentKey, accent]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, accentKey, accent, setTheme, setAccentKey, ACCENTS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
