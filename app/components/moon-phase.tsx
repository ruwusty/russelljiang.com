"use client";

import { useEffect, useState } from "react";

// known new moon: 2000-01-06 18:14 utc
const NEW_MOON_EPOCH = 947182440000;
const SYNODIC_DAYS = 29.530588853;
const SIZE = 7;
const RADIUS = 3.4;

const PHASE_NAMES = [
  "new moon",
  "waxing crescent",
  "first quarter",
  "waxing gibbous",
  "full moon",
  "waning gibbous",
  "last quarter",
  "waning crescent",
];

function moonPhase(now: number): { phase: number; name: string; illum: number } {
  const phase = (((now - NEW_MOON_EPOCH) / 86_400_000 / SYNODIC_DAYS) % 1 + 1) % 1;
  const name = PHASE_NAMES[Math.round(phase * 8) % 8];
  const illum = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  return { phase, name, illum };
}

export function MoonPhase() {
  const [moon, setMoon] = useState<ReturnType<typeof moonPhase> | null>(null);

  useEffect(() => {
    setMoon(moonPhase(Date.now()));
  }, []);

  if (!moon) return null;

  const { phase, name, illum } = moon;
  const waxing = phase < 0.5;

  const cells: { x: number; y: number; lit: boolean }[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - 3;
      const dy = y - 3;
      if (dx * dx + dy * dy > RADIUS * RADIUS) continue;
      // southern hemisphere: the moon waxes from the left
      const nx = dx / RADIUS; // -1..1
      const lit = waxing ? nx < -1 + 2 * illum : nx > 1 - 2 * illum;
      cells.push({ x, y, lit });
    }
  }

  return (
    <span title={`${name} · ${Math.round(illum * 100)}% · as seen from sydney`}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width="14"
        height="14"
        style={{ display: "block", shapeRendering: "crispEdges" }}
        aria-label={name}
        role="img"
      >
        {cells.map(({ x, y, lit }) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="1"
            height="1"
            fill={lit ? "var(--soft)" : "var(--line)"}
          />
        ))}
      </svg>
    </span>
  );
}
