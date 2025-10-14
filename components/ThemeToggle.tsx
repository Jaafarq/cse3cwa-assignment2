"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">();

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("theme")) as "light" | "dark" | null;
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  useEffect(() => {
    if (!theme) return;
    localStorage.setItem("theme", theme);
    // Toggle root variables by data-attribute (no extra CSS files)
    document.documentElement.dataset.theme = theme;
    if (theme === "dark") {
      document.documentElement.style.setProperty("--bg", "#0f1115");
      document.documentElement.style.setProperty("--fg", "#f0f3f7");
      document.documentElement.style.setProperty("--muted", "#9aa4b2");
      document.documentElement.style.setProperty("--border", "#2a2f3a");
    } else {
      document.documentElement.style.setProperty("--bg", "#ffffff");
      document.documentElement.style.setProperty("--fg", "#111111");
      document.documentElement.style.setProperty("--muted", "#666");
      document.documentElement.style.setProperty("--border", "#ddd");
    }
  }, [theme]);

  return (
    <button
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
