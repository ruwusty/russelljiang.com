"use client";

import { useEffect, useRef, useState } from "react";

// petals fall site-wide only once *your* bonsai has bloomed (see /bonsai).
// 336h of growth = the bloom threshold in app/bonsai/bonsai.tsx.
const BLOOM_H = 336;
const MIN_GAP_MS = 18_000;
const MAX_GAP_MS = 45_000;

interface Petal {
  id: number;
  x: number; // percent
  fallMs: number;
  swayMs: number;
}

function hasBloomed(): boolean {
  try {
    const raw = localStorage.getItem("bonsai");
    if (!raw) return false;
    const saved = JSON.parse(raw);
    return typeof saved?.growthH === "number" && saved.growthH >= BLOOM_H;
  } catch {
    return false;
  }
}

function PetalSprite() {
  const cells: [number, number][] = [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ];
  return (
    <svg viewBox="0 0 3 3" width="9" height="9" style={{ shapeRendering: "crispEdges" }}>
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="var(--accent)" />
      ))}
    </svg>
  );
}

export function PetalDrift() {
  const [petals, setPetals] = useState<Petal[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!hasBloomed()) return;

    let t: ReturnType<typeof setTimeout>;
    const drop = () => {
      const petal: Petal = {
        id: idRef.current++,
        x: 5 + Math.random() * 90,
        fallMs: 7000 + Math.random() * 4000,
        swayMs: 2200 + Math.random() * 900,
      };
      setPetals((current) => [...current, petal]);
      setTimeout(() => {
        setPetals((current) => current.filter((p) => p.id !== petal.id));
      }, petal.fallMs + 300);
      t = setTimeout(drop, MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS));
    };
    t = setTimeout(drop, 6000 + Math.random() * 12000);
    return () => clearTimeout(t);
  }, []);

  if (petals.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-30" aria-hidden="true">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.x}%`,
            top: "-16px",
            animation: `petal-fall ${petal.fallMs}ms linear forwards`,
          }}
        >
          <div
            style={{
              animation: `petal-sway ${petal.swayMs}ms ease-in-out infinite alternate`,
            }}
          >
            <PetalSprite />
          </div>
        </div>
      ))}
    </div>
  );
}
