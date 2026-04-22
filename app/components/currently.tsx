"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  "trying to unify the forces",
  "fighting the curse of dimensionality",
  "p-hacking my sleep schedule",
  "overfitting to vibes",
  "minimising loss (emotional)",
  "searching for a closed-form solution to undergrad",
  "stuck in a local minimum",
  "waiting for the gradient to converge",
  "proving P ≠ productive",
  "touching grass (out of distribution)",
  "running on stochastic caffeine descent",
  "practising until the neighbours file a complaint",
  "arguing with a metronome",
  "negotiating with a reed",
  "pretending I can sight-read",
  "speedrunning MATH1081",
  "Ctrl+F'ing lecture slides",
  "debugging my sleep schedule",
  "reading the docs (finally)",
  "grinding one more Leetcode problem before bed (lying)",
  "compiling excuses",
  "thinking about pho",
  "touching grass",
  "reading",
  "shipping",
  "napping deterministically",
  "scrolling",
  "sleeping",
];

function shuffled<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function Currently() {
  const [queue] = useState(() => shuffled(ITEMS));
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const tick = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % queue.length);
        setVisible(true);
      }, 300);
    }, 4200);

    return () => clearInterval(tick);
  }, [queue.length]);

  return (
    <span
      className="flex items-center gap-2 text-[13px] min-w-0"
      style={{
        color: "var(--muted)",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
      <span style={{ color: "var(--muted)", opacity: 0.7 }}>~</span>
      <span className="shrink-0">currently</span>
      <span
        aria-live="polite"
        className="truncate"
        style={{
          color: "var(--text)",
          opacity: visible ? 0.85 : 0,
          transform: visible ? "translateY(0)" : "translateY(3px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          minWidth: 0,
        }}
      >
        {queue[index]}
      </span>
    </span>
  );
}
