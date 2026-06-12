"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "bonsai";
const W = 44;
const H = 38;
const PX = 3;

// hours of growth to reach each stage
const STAGES: [number, string][] = [
  [0, "seed"],
  [2, "sprout"],
  [24, "sapling"],
  [72, "young tree"],
  [168, "mature"],
  [336, "in bloom"],
];
const BLOOM_H = 336;
const DRAIN_PER_H = 100 / 48; // a full pot lasts two days
const PETAL_EVERY_H = 3;
const PETALS_CAP = 12;

interface BonsaiState {
  seed: number;
  plantedAt: number;
  growthH: number;
  water: number;
  petalsReady: number;
  petals: number;
  lastTick: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function freshState(now: number): BonsaiState {
  return {
    seed: Math.floor(Math.random() * 0xffffffff),
    plantedAt: now,
    growthH: 0,
    water: 100,
    petalsReady: 0,
    petals: 0,
    lastTick: now,
  };
}

// growth happens while there's water, even when the tab is closed
function catchUp(s: BonsaiState, now: number): BonsaiState {
  const elapsedH = Math.max(0, (now - s.lastTick) / 3_600_000);
  const wateredH = Math.min(elapsedH, s.water / DRAIN_PER_H);
  const growthH = s.growthH + wateredH;
  const blooming = growthH >= BLOOM_H;
  return {
    ...s,
    growthH,
    water: clamp(s.water - elapsedH * DRAIN_PER_H, 0, 100),
    petalsReady: blooming
      ? clamp(s.petalsReady + wateredH / PETAL_EVERY_H, 0, PETALS_CAP)
      : 0,
    lastTick: now,
  };
}

function loadState(now: number): BonsaiState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (typeof saved?.seed === "number" && typeof saved?.growthH === "number") {
        return catchUp({ ...freshState(now), ...saved }, now);
      }
    }
  } catch {}
  return freshState(now);
}

function persist(s: BonsaiState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

// deterministic prng — same seed always grows the same tree
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Cell {
  x: number;
  y: number;
  order: number; // 0..1, how far into growth this cell appears
}

interface Tip {
  x: number;
  y: number;
  order: number;
}

function generateTree(seed: number): { wood: Cell[]; tips: Tip[] } {
  const rng = mulberry32(seed);
  const wood: Cell[] = [];
  const tips: Tip[] = [];
  let counter = 0;

  const branch = (x: number, y: number, lean: number, len: number, depth: number) => {
    let cx = x;
    let cy = y;
    for (let i = 0; i < len; i++) {
      cy -= 1;
      cx += Math.round(lean + (rng() - 0.5) * 1.8);
      cx = clamp(cx, 3, W - 4);
      if (cy < 10) break;
      wood.push({ x: cx, y: cy, order: counter++ });
      if (depth === 0) wood.push({ x: cx + 1, y: cy, order: counter++ }); // thick trunk
    }
    if (depth >= 4 || cy < 13 || (depth >= 2 && rng() < 0.3)) {
      tips.push({ x: cx, y: cy, order: counter++ });
      return;
    }
    const kids = depth === 0 ? 3 : rng() < 0.8 ? 2 : 1;
    for (let k = 0; k < kids; k++) {
      const spread = depth === 0 ? (k - 1) * 1.1 : (rng() - 0.5) * 2.4;
      const newLean = clamp(lean + spread + (rng() - 0.5) * 0.8, -1.6, 1.6);
      branch(cx, cy, newLean, Math.max(2, Math.round(len * 0.75)), depth + 1);
    }
  };

  branch(Math.floor(W / 2) - 1, H - 7, 0, 5, 0);

  const total = counter || 1;
  return {
    wood: wood.map((c) => ({ ...c, order: c.order / total })),
    tips: tips.map((t) => ({ ...t, order: t.order / total })),
  };
}

const FOLIAGE_OFFSETS: [number, number][] = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, -1],
  [1, -1],
  [-1, -1],
  [2, 0],
  [-2, 0],
  [0, 1],
  [1, 1],
  [-1, 1],
  [0, -2],
  [2, -1],
  [-2, -1],
  [3, 0],
  [-3, 0],
  [1, -2],
  [-1, -2],
];

function TreeSvg({ state }: { state: BonsaiState }) {
  const tree = useMemo(() => generateTree(state.seed), [state.seed]);

  const cells = useMemo(() => {
    const map = new Map<string, string>();
    const put = (x: number, y: number, color: string) => {
      if (x >= 0 && x < W && y >= 0 && y < H) map.set(`${x},${y}`, color);
    };

    // pot
    for (let x = 13; x <= 30; x++) put(x, H - 5, "var(--ink)");
    for (let y = H - 4; y <= H - 2; y++) {
      const inset = y - (H - 4);
      for (let x = 14 + inset; x <= 29 - inset; x++) put(x, y, "var(--soft)");
      put(13 + inset, y, "var(--ink)");
      put(30 - inset, y, "var(--ink)");
    }
    // soil
    for (let x = 15; x <= 28; x++) put(x, H - 6, "var(--faint)");

    const g = state.growthH;
    if (g < 2) {
      // a seed's worth of optimism
      put(21, H - 7, "var(--green)");
      if (g > 0.5) put(21, H - 8, "var(--green)");
      return map;
    }

    // wood appears in growth order; eased so early growth feels fast
    const frac = Math.min(1, Math.pow(g / BLOOM_H, 0.55));
    for (const c of tree.wood) {
      if (c.order <= frac) put(c.x, c.y, "var(--ink)");
    }

    // foliage once sapling, fuller with age
    if (g >= 24) {
      const radius = g >= 168 ? FOLIAGE_OFFSETS.length : g >= 72 ? 11 : 6;
      const bloomFrac = clamp((g - BLOOM_H) / 168, 0, 1);
      const rng = mulberry32(state.seed ^ 0x9e3779b9);
      for (const tip of tree.tips) {
        if (tip.order > frac) continue;
        for (const [dx, dy] of FOLIAGE_OFFSETS.slice(0, radius)) {
          const blossom = g >= BLOOM_H && rng() < bloomFrac * 0.45;
          put(tip.x + dx, tip.y + dy, blossom ? "var(--accent)" : "var(--green)");
        }
      }
    }

    return map;
  }, [tree, state.growthH, state.seed]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W * PX}
      height={H * PX}
      style={{ display: "block", shapeRendering: "crispEdges" }}
      aria-hidden="true"
    >
      {[...cells.entries()].map(([key, color]) => {
        const [x, y] = key.split(",").map(Number);
        return <rect key={key} x={x} y={y} width="1" height="1" fill={color} />;
      })}
    </svg>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  const filled = Math.round((value / 100) * 5);
  return (
    <span className="flex items-baseline gap-2">
      <span style={{ color: "var(--faint)" }}>{label}</span>
      <span style={{ color: "var(--soft)" }}>
        {"█".repeat(filled)}
        <span style={{ color: "var(--line)" }}>{"░".repeat(5 - filled)}</span>
      </span>
    </span>
  );
}

function stageName(growthH: number): string {
  let name = STAGES[0][1];
  for (const [at, label] of STAGES) {
    if (growthH >= at) name = label;
  }
  return name;
}

export function Bonsai() {
  const [state, setState] = useState<BonsaiState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const s = loadState(Date.now());
    setState(s);
    persist(s);
    // keep time passing while the page is open
    const tick = setInterval(() => {
      setState((current) => {
        if (!current) return current;
        const next = catchUp(current, Date.now());
        persist(next);
        return next;
      });
    }, 60_000);
    return () => clearInterval(tick);
  }, []);

  const say = (text: string) => {
    setMessage(text);
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    msgTimerRef.current = setTimeout(() => setMessage(null), 4500);
  };

  if (!state) {
    return (
      <p className="text-[12px] lowercase" style={{ color: "var(--faint)" }}>
        finding the pot…
      </p>
    );
  }

  const update = (next: BonsaiState) => {
    setState(next);
    persist(next);
  };

  const water = () => {
    const wasDry = state.water <= 0;
    update({ ...catchUp(state, Date.now()), water: 100 });
    say(wasDry ? "the tree drinks. growth resumes." : "the tree drinks. quietly.");
  };

  const gather = () => {
    const ready = Math.floor(state.petalsReady);
    if (ready < 1) return;
    update({ ...state, petals: state.petals + ready, petalsReady: state.petalsReady - ready });
    say(ready === 1 ? "one petal, kept." : `${ready} petals, kept.`);
  };

  const ageDays = Math.floor((Date.now() - state.plantedAt) / 86_400_000);
  const blooming = state.growthH >= BLOOM_H;
  const petalsReady = Math.floor(state.petalsReady);

  return (
    <div>
      <div className="flex items-baseline gap-6 flex-wrap text-[12px]">
        <span className="flex items-baseline gap-2">
          <span style={{ color: "var(--faint)" }}>age</span>
          <span style={{ color: "var(--soft)" }}>
            {ageDays}d · {stageName(state.growthH)}
          </span>
        </span>
        <Bar label="water" value={state.water} />
        {(blooming || state.petals > 0) && (
          <span className="flex items-baseline gap-2">
            <span style={{ color: "var(--faint)" }}>petals</span>
            <span style={{ color: "var(--soft)" }}>{state.petals}</span>
          </span>
        )}
      </div>

      <div
        className="relative mt-8 flex justify-center pb-0"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <TreeSvg state={state} />
      </div>

      <div className="mt-4 flex items-baseline gap-4 flex-wrap text-[12px]">
        <button onClick={water} className="tui-btn text-[12px]" style={{ color: "var(--green)" }}>
          [water]
        </button>
        {petalsReady > 0 && (
          <button onClick={gather} className="tui-btn text-[12px]" style={{ color: "var(--accent)" }}>
            [gather {petalsReady} petal{petalsReady === 1 ? "" : "s"}]
          </button>
        )}
        <span
          className="text-[12px] lowercase min-h-[1em]"
          style={{ color: "var(--soft)" }}
          aria-live="polite"
        >
          {message ?? (state.water <= 0 ? "the soil is dry. the tree waits." : "")}
        </span>
      </div>

      <p className="mt-6 text-[11px] lowercase" style={{ color: "var(--faint)" }}>
        it grows in real time, watered or not-watered. no two trees branch alike.
        come back tomorrow.
      </p>
    </div>
  );
}
