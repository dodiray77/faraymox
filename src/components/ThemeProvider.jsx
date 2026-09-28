"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "dark", toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  // Initialize state with function — runs ONCE at mount, NOT in useEffect
  const [theme, setTheme] = useState(() => {
    // Hanya di klien (browser), localStorage tersedia
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("sentinel-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return saved || (prefersDark ? "dark" : "dark");
  });

  // Just sync DOM classes + localStorage when theme changes (from toggle)
  useEffect(() => {
    // Juga hanya di klien
    if (typeof window === "undefined") return;
    document.documentElement.classList.toggle("my-app-dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("sentinel-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
