"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FRAME_A, FRAME_B, Sprite } from "../components/lost-cat";

const STORAGE_KEY = "cat404";
const WALK_MS = 3200;
const STEP_MS = 260;
// hunger rises ~1/10min, mood falls ~1/15min while you're away
const HUNGER_PER_MIN = 0.1;
const MOOD_DECAY_PER_MIN = 1 / 15;

interface PetState {
  hunger: number; // 0 full … 100 starving
  mood: number; // 0 miserable … 100 delighted
  bond: number; // only ever goes up
  ts: number;
}

const FRESH: PetState = { hunger: 30, mood: 70, bond: 0, ts: 0 };

const clamp = (v: number) => Math.max(0, Math.min(100, v));

function loadPet(now: number): PetState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...FRESH, ts: now };
    const saved = JSON.parse(raw);
    const elapsedMin = Math.max(0, (now - (saved.ts ?? now)) / 60000);
    return {
      hunger: clamp((saved.hunger ?? FRESH.hunger) + elapsedMin * HUNGER_PER_MIN),
      mood: clamp((saved.mood ?? FRESH.mood) - elapsedMin * MOOD_DECAY_PER_MIN),
      bond: Math.max(0, saved.bond ?? 0),
      ts: now,
    };
  } catch {
    return { ...FRESH, ts: now };
  }
}

const PET_MSGS = [
  "the cat permits this.",
  "purring detected.",
  "it leans in. slightly.",
  "acceptable, apparently.",
];
const FEED_MSGS = [
  "om nom nom.",
  "the bowl is inspected, then approved.",
  "it eats like it's been wronged.",
];
const FULL_MSG = "the cat is full. it judges the offer.";
const PLAY_MSGS = [
  "the zoomies are upon it.",
  "it chased nothing, victoriously.",
  "play has concluded. the cat won.",
];
const HUNGRY_MSG = "the cat is hungry. it's judging you.";

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

function Bar({ label, value }: { label: string; value: number }) {
  const filled = Math.round((value / 100) * 5);
  return (
    <span className="flex items-baseline gap-2">
      <span className="w-[5ch]" style={{ color: "var(--faint)" }}>
        {label}
      </span>
      <span style={{ color: "var(--soft)" }}>
        {"█".repeat(filled)}
        <span style={{ color: "var(--line)" }}>{"░".repeat(5 - filled)}</span>
      </span>
    </span>
  );
}

function PixelHeart() {
  const rows = [".X.X.", "XXXXX", "XXXXX", ".XXX.", "..X.."];
  return (
    <svg viewBox="0 0 5 5" width="15" height="15" style={{ shapeRendering: "crispEdges" }}>
      {rows.flatMap((row, y) =>
        row.split("").map((ch, x) =>
          ch === "X" ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="var(--accent)" />
          ) : null
        )
      )}
    </svg>
  );
}

export function CatPet() {
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [pet, setPet] = useState<PetState | null>(null);
  const [x, setX] = useState(40);
  const [dir, setDir] = useState(1);
  const [stepFrame, setStepFrame] = useState(false);
  const [heart, setHeart] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busyUntil, setBusyUntil] = useState(0);
  const xRef = useRef(40);
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setPet(loadPet(Date.now()));
  }, []);

  const save = useCallback((next: PetState) => {
    setPet(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...next, ts: Date.now() }));
    } catch {}
  }, []);

  const say = (text: string) => {
    setMessage(text);
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    msgTimerRef.current = setTimeout(() => setMessage(null), 4000);
  };

  // wander, unless mid-reaction
  useEffect(() => {
    if (reduced !== false) return;
    let t: ReturnType<typeof setTimeout>;
    const hop = () => {
      if (Date.now() > busyUntil) {
        const next = 4 + Math.random() * 78;
        setDir(next > xRef.current ? 1 : -1);
        xRef.current = next;
        setX(next);
      }
      t = setTimeout(hop, WALK_MS + 800 + Math.random() * 2400);
    };
    t = setTimeout(hop, 900);
    return () => clearTimeout(t);
  }, [reduced, busyUntil]);

  useEffect(() => {
    if (reduced !== false) return;
    const tick = setInterval(() => setStepFrame((s) => !s), STEP_MS);
    return () => clearInterval(tick);
  }, [reduced]);

  // occasional guilt trip
  useEffect(() => {
    if (!pet || pet.hunger < 75) return;
    const t = setTimeout(() => say(HUNGRY_MSG), 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet?.hunger]);

  if (!pet) {
    return (
      <p className="text-[12px] lowercase" style={{ color: "var(--faint)" }}>
        looking for the cat…
      </p>
    );
  }

  const pause = (ms: number) => setBusyUntil(Date.now() + ms);

  const doPet = () => {
    save({ ...pet, mood: clamp(pet.mood + 6), bond: pet.bond + 1 });
    setHeart(true);
    setTimeout(() => setHeart(false), 1500);
    pause(1500);
    say(pick(PET_MSGS));
  };

  const doFeed = () => {
    if (pet.hunger < 8) {
      say(FULL_MSG);
      return;
    }
    save({ ...pet, hunger: clamp(pet.hunger - 30), mood: clamp(pet.mood + 3), bond: pet.bond + 1 });
    pause(1800);
    say(pick(FEED_MSGS));
  };

  const doPlay = () => {
    save({
      ...pet,
      mood: clamp(pet.mood + 10),
      hunger: clamp(pet.hunger + 8),
      bond: pet.bond + 2,
    });
    say(pick(PLAY_MSGS));
    // zoomies: three quick dashes
    if (reduced === false) {
      pause(2600);
      [0, 700, 1400].forEach((delay) => {
        setTimeout(() => {
          const next = 4 + Math.random() * 78;
          setDir(next > xRef.current ? 1 : -1);
          xRef.current = next;
          setX(next);
        }, delay);
      });
    }
  };

  const bondLevel = Math.floor(pet.bond / 8) + 1;
  const zooming = Date.now() < busyUntil && heart === false;

  return (
    <div>
      {/* stats */}
      <div className="flex items-baseline gap-6 flex-wrap text-[12px]">
        <Bar label="fed" value={100 - pet.hunger} />
        <Bar label="mood" value={pet.mood} />
        <span className="flex items-baseline gap-2">
          <span style={{ color: "var(--faint)" }}>bond</span>
          <span style={{ color: "var(--soft)" }}>lv {bondLevel}</span>
        </span>
      </div>

      {/* the cat */}
      <div
        className="relative mt-8 h-[110px] overflow-hidden"
        style={{ borderBottom: "1px solid var(--line)" }}
        aria-hidden="true"
      >
        <div
          className="absolute bottom-0"
          style={{
            left: `${x}%`,
            transition:
              reduced !== false
                ? undefined
                : zooming
                  ? "left 600ms cubic-bezier(0.3, 0.7, 0.4, 1)"
                  : `left ${WALK_MS}ms linear`,
          }}
        >
          {heart && (
            <div className="absolute -top-5 left-[36px]">
              <PixelHeart />
            </div>
          )}
          <Sprite frame={stepFrame ? FRAME_B : FRAME_A} flip={dir < 0} />
        </div>
      </div>

      {/* actions */}
      <div className="mt-4 flex items-baseline gap-4 text-[12px]">
        <button onClick={doPet} className="tui-btn text-[12px]" style={{ color: "var(--green)" }}>
          [pet]
        </button>
        <button onClick={doFeed} className="tui-btn text-[12px]" style={{ color: "var(--green)" }}>
          [feed]
        </button>
        <button onClick={doPlay} className="tui-btn text-[12px]" style={{ color: "var(--green)" }}>
          [play]
        </button>
        <span className="text-[12px] lowercase min-h-[1em]" style={{ color: "var(--soft)" }} aria-live="polite">
          {message ?? ""}
        </span>
      </div>

      <p className="mt-6 text-[11px] lowercase" style={{ color: "var(--faint)" }}>
        it lives in your browser. it remembers whether you visit.
      </p>
    </div>
  );
}
