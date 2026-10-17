"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FRAME_A, Sprite } from "../components/lost-cat";

// the cat sleeps here sometimes, eyes closed
const NAP_FRAME = FRAME_A.map((row) => row.replaceAll("o", "X"));

const STORAGE_KEY = "bonsai";
const W = 44;
const H = 38;
const PX = 5; // same pixel size as the cat that naps beside it

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
const SAUCER_DRAIN_PER_H = 100 / 72; // three, with the deeper saucer
const PETAL_EVERY_H = 3;
const PETALS_CAP = 12;

interface Owned {
  plaque: string | null;
  lantern: boolean;
  glaze: boolean;
  stones: boolean;
  frog: boolean;
  saucer: boolean;
  moon: boolean;
}

type ShopKey = Exclude<keyof Owned, "plaque">;

// everything but the plaque, cheapest first
const SHOP: { key: ShopKey; name: string; price: number; blurb: string; got: string; line: string }[] = [
  { key: "stones", name: "river stones", price: 8, blurb: "for the ground", got: "placed", line: "stones. they were going to be here anyway." },
  { key: "glaze", name: "clay glaze", price: 15, blurb: "reglaze the pot", got: "applied", line: "the pot wears clay now." },
  { key: "frog", name: "ceramic frog", price: 20, blurb: "for safe returns", got: "sitting", line: "a frog. it'll make sure you come back." },
  { key: "lantern", name: "stone lantern", price: 25, blurb: "for the garden's edge", got: "placed", line: "a lantern. the evenings improve." },
  { key: "saucer", name: "deeper saucer", price: 30, blurb: "a full pot lasts three days", got: "under the pot", line: "a deeper saucer. the roots relax." },
  { key: "moon", name: "the moon", price: 50, blurb: "for viewing", got: "risen", line: "it was always there. now it's yours." },
];

interface BonsaiState {
  seed: number;
  plantedAt: number;
  growthH: number;
  water: number;
  petalsReady: number;
  petals: number;
  lastTick: number;
  owned: Owned;
}

const PLAQUE_PRICE = 10;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// sydney seasons
type Season = "summer" | "autumn" | "winter" | "spring";

function currentSeason(): Season {
  const m = new Date().getMonth(); // 0-11
  if (m === 11 || m <= 1) return "summer";
  if (m <= 4) return "autumn";
  if (m <= 7) return "winter";
  return "spring";
}

function freshState(now: number): BonsaiState {
  return {
    seed: Math.floor(Math.random() * 0xffffffff),
    plantedAt: now,
    growthH: 0,
    water: 100,
    petalsReady: 0,
    petals: 0,
    lastTick: now,
    owned: { plaque: null, lantern: false, glaze: false, stones: false, frog: false, saucer: false, moon: false },
  };
}

// growth happens while there's water, even when the tab is closed
function catchUp(s: BonsaiState, now: number): BonsaiState {
  const elapsedH = Math.max(0, (now - s.lastTick) / 3_600_000);
  const drain = s.owned.saucer ? SAUCER_DRAIN_PER_H : DRAIN_PER_H;
  const wateredH = Math.min(elapsedH, s.water / drain);
  const growthH = s.growthH + wateredH;
  const blooming = growthH >= BLOOM_H;
  return {
    ...s,
    growthH,
    water: clamp(s.water - elapsedH * drain, 0, 100),
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
        const base = freshState(now);
        return catchUp(
          { ...base, ...saved, owned: { ...base.owned, ...(saved.owned ?? {}) } },
          now
        );
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

function TreeSvg({ state, season }: { state: BonsaiState; season: Season }) {
  const tree = useMemo(() => generateTree(state.seed), [state.seed]);

  const cells = useMemo(() => {
    const map = new Map<string, string>();
    const put = (x: number, y: number, color: string) => {
      if (x >= 0 && x < W && y >= 0 && y < H) map.set(`${x},${y}`, color);
    };
    const stamp = (art: string[], x0: number, y0: number, colors: Record<string, string>) =>
      art.forEach((row, dy) =>
        [...row].forEach((ch, dx) => colors[ch] && put(x0 + dx, y0 + dy, colors[ch]))
      );

    // the moon, drawn first so branches can cross it
    if (state.owned.moon) {
      stamp(["..@@@..", ".@@....", "@@.....", "@@.....", "@@.....", ".@@....", "..@@@.."], 35, 2, { "@": "var(--accent)" });
    }

    // pot: unfired and pale until you've earned the glaze, which darkens it.
    // never accent — a solid slab of clay reads as a brown block on paper
    const potBody = state.owned.glaze ? "var(--soft)" : "var(--faint)";
    for (let x = 13; x <= 30; x++) put(x, H - 5, "var(--ink)");
    for (let y = H - 4; y <= H - 2; y++) {
      const inset = y - (H - 4);
      for (let x = 14 + inset; x <= 29 - inset; x++) put(x, y, potBody);
      put(13 + inset, y, "var(--ink)");
      put(30 - inset, y, "var(--ink)");
    }
    // soil
    for (let x = 15; x <= 28; x++) put(x, H - 6, "var(--faint)");

    // stone lantern, keeping the tree company
    if (state.owned.lantern) {
      const LANTERN = [
        "....K....",
        "..KKKKK..",
        ".KKKKKKK.",
        "...KKK...",
        "..KK@KK..",
        "..K@@@K..",
        "..KKKKK..",
        "....K....",
        "....K....",
        "...KKK...",
        "..KKKKK..",
      ];
      stamp(LANTERN, 2, H - 2 - LANTERN.length + 1, { K: "var(--soft)", "@": "var(--accent)" });
    }

    // river stones, right of the pot
    if (state.owned.stones) {
      stamp(["..KK...K..", ".KKKK.KKK."], 33, H - 3, { K: "var(--soft)" });
    }

    // the frog sits on the rim, in front of everything, so it goes on last
    const frog = () => {
      if (state.owned.frog) stamp([".I.I.", "KKKKK", "K.K.K"], 25, H - 8, { K: "var(--soft)", I: "var(--ink)" });
    };

    const g = state.growthH;
    if (g < 2) {
      // a seed's worth of optimism
      put(21, H - 7, "var(--rose)");
      if (g > 0.5) put(21, H - 8, "var(--rose)");
      frog();
      return map;
    }

    // wood appears in growth order; eased so early growth feels fast
    const frac = Math.min(1, Math.pow(g / BLOOM_H, 0.55));
    for (const c of tree.wood) {
      if (c.order <= frac) put(c.x, c.y, "var(--ink)");
    }

    // foliage once sapling, fuller with age, dressed for the season
    if (g >= 24) {
      const baseRadius = g >= 168 ? FOLIAGE_OFFSETS.length : g >= 72 ? 11 : 6;
      const radius =
        season === "winter" ? Math.max(3, Math.floor(baseRadius / 2)) : baseRadius;
      const bloomBase = clamp((g - BLOOM_H) / 168, 0, 1);
      // the season sets the intensity: spring riots, winter barely holds on
      const seasonMul = { spring: 1.6, summer: 1, autumn: 0.4, winter: 0.35 }[season];
      const bloomFrac = Math.min(1, bloomBase * seasonMul);
      const rng = mulberry32(state.seed ^ 0x9e3779b9);
      for (const tip of tree.tips) {
        if (tip.order > frac) continue;
        for (const [dx, dy] of FOLIAGE_OFFSETS.slice(0, radius)) {
          const roll = rng();
          const blossom = g >= BLOOM_H && roll < bloomFrac * 0.45;
          const turned = season === "autumn" && roll < 0.5;
          // blossoms are a paper-tint of the foliage green, never accent —
          // clay flecks on green read as dead leaves. turned autumn leaves
          // fade to soft rather than browning.
          put(
            tip.x + dx,
            tip.y + dy,
            blossom
              ? "color-mix(in srgb, var(--rose) 40%, var(--bg))"
              : turned
                ? "var(--soft)"
                : "var(--rose)"
          );
        }
      }
    }

    frog();
    return map;
  }, [tree, state.growthH, state.seed, season, state.owned]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W * PX}
      height={H * PX}
      style={{ display: "block", shapeRendering: "crispEdges", maxWidth: "100%", height: "auto" }}
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
      <span style={{ color: "var(--soft)" }}>{label}</span>
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
  const [shopOpen, setShopOpen] = useState(false);
  const [plaqueDraft, setPlaqueDraft] = useState<string | null>(null);
  const [catNapping, setCatNapping] = useState(false);
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const s = loadState(Date.now());
    setState(s);
    persist(s);
    // a bonded cat sometimes wanders over from /404 for a nap
    try {
      const cat = JSON.parse(localStorage.getItem("cat404") ?? "null");
      if (typeof cat?.bond === "number" && cat.bond >= 16 && Math.random() < 0.4) {
        setCatNapping(true);
      }
    } catch {}
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
      <p className="text-[12px] lowercase" style={{ color: "var(--soft)" }}>
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

  const spend = (price: number, owned: Partial<Owned>, line: string) => {
    if (state.petals < price) {
      say("not enough petals. the tree appreciates patience.");
      return;
    }
    update({ ...state, petals: state.petals - price, owned: { ...state.owned, ...owned } });
    say(line);
  };

  const engrave = () => {
    const name = (plaqueDraft ?? "").replace(/\s+/g, " ").trim().slice(0, 16);
    if (!name) return;
    spend(PLAQUE_PRICE, { plaque: name }, "engraved.");
    setPlaqueDraft(null);
  };

  const ageDays = Math.floor((Date.now() - state.plantedAt) / 86_400_000);
  const blooming = state.growthH >= BLOOM_H;
  const petalsReady = Math.floor(state.petalsReady);
  const season = currentSeason();

  return (
    <div>
      <div className="flex items-baseline gap-6 flex-wrap text-[12px]">
        <span className="flex items-baseline gap-2">
          <span style={{ color: "var(--soft)" }}>age</span>
          <span style={{ color: "var(--soft)" }}>
            {ageDays}d · {stageName(state.growthH)}
          </span>
          <span style={{ color: "var(--soft)" }}>· {season}</span>
        </span>
        <Bar label="water" value={state.water} />
        {(blooming || state.petals > 0) && (
          <span className="flex items-baseline gap-2">
            <span style={{ color: "var(--soft)" }}>petals</span>
            <span style={{ color: "var(--soft)" }}>{state.petals}</span>
          </span>
        )}
      </div>

      <div
        className="relative mt-8 flex justify-center pb-0"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <TreeSvg state={state} season={season} />
        {catNapping && (
          <div className="absolute bottom-0" style={{ left: `min(calc(50% + ${(W * PX) / 2 + 10}px), calc(100% - 90px))` }} aria-hidden="true">
            <span
              className="absolute -top-4 left-2 text-[10px]"
              style={{ color: "var(--faint)" }}
            >
              z z
            </span>
            <Sprite frame={NAP_FRAME} flip={true} />
          </div>
        )}
      </div>
      {state.owned.plaque && (
        <p className="mt-2 text-center text-[11px]" style={{ color: "var(--faint)" }}>
          「{state.owned.plaque}」
        </p>
      )}

      <div className="mt-4 flex items-baseline gap-4 flex-wrap text-[12px]">
        <button onClick={water} className="tui-btn text-[12px]" style={{ color: "var(--rose)" }}>
          [water]
        </button>
        {petalsReady > 0 && (
          <button onClick={gather} className="tui-btn text-[12px]" style={{ color: "var(--accent)" }}>
            [gather {petalsReady} petal{petalsReady === 1 ? "" : "s"}]
          </button>
        )}
        {(state.petals > 0 || blooming) && (
          <button
            onClick={() => {
              setShopOpen((v) => !v);
              setPlaqueDraft(null);
            }}
            className="tui-btn text-[12px]"
          >
            [shop]
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

      {shopOpen && (
        <div className="mt-5 text-[12px] lowercase flex flex-col gap-1.5">
          <div className="flex items-center gap-2" style={{ color: "var(--soft)" }}>
            <span style={{ color: "var(--rose)" }}>❯</span>
            <span>petal shop · you have {state.petals}</span>
          </div>

          {state.owned.plaque ? (
            <span style={{ color: "var(--soft)" }}>name plaque · engraved</span>
          ) : plaqueDraft !== null ? (
            <span className="flex items-baseline gap-2">
              <input
                value={plaqueDraft}
                onChange={(e) => setPlaqueDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") engrave();
                  if (e.key === "Escape") setPlaqueDraft(null);
                }}
                maxLength={16}
                autoFocus
                placeholder="name the tree"
                className="px-2 py-0.5 text-[12px] outline-none w-[150px]"
                style={{
                  background: "transparent",
                  border: "1px solid var(--line)",
                  color: "var(--ink)",
                  fontFamily: "inherit",
                }}
                aria-label="tree name"
              />
              <button onClick={engrave} className="tui-btn text-[12px]" style={{ color: "var(--rose)" }}>
                [engrave]
              </button>
              <button onClick={() => setPlaqueDraft(null)} className="tui-btn text-[12px]">
                [x]
              </button>
            </span>
          ) : (
            <button
              onClick={() => setPlaqueDraft("")}
              className="tui-btn text-left text-[12px]"
              style={{ color: "var(--soft)" }}
            >
              [name plaque · {PLAQUE_PRICE} petals] — give the tree a name
            </button>
          )}

          {SHOP.map((item) =>
            state.owned[item.key] ? (
              <span key={item.key} style={{ color: "var(--soft)" }}>
                {item.name} · {item.got}
              </span>
            ) : (
              <button
                key={item.key}
                onClick={() => spend(item.price, { [item.key]: true }, item.line)}
                className="tui-btn text-left text-[12px]"
                style={{ color: "var(--soft)" }}
              >
                [{item.name} · {item.price} petals] — {item.blurb}
              </button>
            )
          )}
        </div>
      )}

      <p className="mt-6 text-[11px] lowercase" style={{ color: "var(--soft)" }}>
        it grows in real time, watered or not-watered. no two trees branch alike.
        come back tomorrow.
      </p>
    </div>
  );
}
