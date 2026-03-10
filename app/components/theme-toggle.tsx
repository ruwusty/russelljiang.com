"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const MoonIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="5" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
    <line x1="2" y1="12" x2="5" y2="12" />
    <line x1="19" y1="12" x2="22" y2="12" />
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
    <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
  </svg>
);

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Render an invisible placeholder before mount to avoid layout shift
  if (!mounted) return <div style={{ width: 52, height: 28 }} />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "relative",
        width: 52,
        height: 28,
        borderRadius: 14,
        border: "1px solid var(--border)",
        background: "transparent",
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        transition: "border-color 0.2s ease",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "var(--accent)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "var(--border)";
      }}
    >
      {/* Moon label */}
      <span
        style={{
          position: "absolute",
          left: 8,
          color: isDark ? "var(--accent)" : "var(--tag-text)",
          opacity: isDark ? 1 : 0.5,
          transition: "all 0.25s ease",
          display: "flex",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <MoonIcon />
      </span>

      {/* Sun label */}
      <span
        style={{
          position: "absolute",
          right: 7,
          color: !isDark ? "var(--accent)" : "var(--tag-text)",
          opacity: !isDark ? 1 : 0.5,
          transition: "all 0.25s ease",
          display: "flex",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <SunIcon />
      </span>

      {/* Sliding handle */}
      <span
        style={{
          position: "absolute",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: isDark ? "#1c1c2e" : "#ffffff",
          border: isDark
            ? "1px solid rgba(129,140,248,0.25)"
            : "1px solid rgba(99,102,241,0.2)",
          boxShadow: isDark
            ? "0 0 10px rgba(129,140,248,0.18), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 1px 4px rgba(0,0,0,0.12), 0 0 10px rgba(99,102,241,0.12)",
          left: isDark ? 2 : 26,
          transition: "left 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.25s ease, box-shadow 0.25s ease",
          pointerEvents: "none",
        }}
      />
    </button>
  );
}
