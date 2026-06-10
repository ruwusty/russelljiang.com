"use client";

import { useEffect, useRef, useState } from "react";
import { FRAME_A, FRAME_B, Sprite } from "./lost-cat";

const CAMEO_CHANCE = 0.05;
const STEP_MS = 260;
const MEOW = ["m", "e", "o", "w"];

interface Walker {
  id: number;
  bottom: number;
  durationMs: number;
  delayMs: number;
  scale: number;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

export function CatCameo() {
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [stepFrame, setStepFrame] = useState(false);
  const idRef = useRef(0);
  const reducedRef = useRef(false);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(r);
    reducedRef.current = r;
  }, []);

  const spawn = (count: number) => {
    const parade = count > 1;
    const fresh: Walker[] = Array.from({ length: count }, () => ({
      id: idRef.current++,
      bottom: parade ? Math.random() * 44 : 0,
      durationMs: 11000 + Math.random() * 6000,
      delayMs: parade ? Math.random() * 2600 : 0,
      scale: parade ? 0.6 + Math.random() * 0.8 : 1,
    }));
    setWalkers((current) => [...current, ...fresh]);
    for (const w of fresh) {
      const ttl = reducedRef.current ? 2500 : w.delayMs + w.durationMs + 400;
      setTimeout(() => {
        setWalkers((current) => current.filter((c) => c.id !== w.id));
      }, ttl);
    }
  };

  // 5% chance per page load that the cat strolls through
  useEffect(() => {
    if (reduced !== false) return;
    if (Math.random() >= CAMEO_CHANCE) return;
    const t = setTimeout(() => spawn(1), 4000 + Math.random() * 10000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // typed "meow" summons one
  useEffect(() => {
    let mi = 0;
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const lower = event.key.toLowerCase();
      mi = lower === MEOW[mi] ? mi + 1 : lower === MEOW[0] ? 1 : 0;
      if (mi === MEOW.length) {
        mi = 0;
        spawn(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // shared leg timer while any cat is on screen
  const anyWalkers = walkers.length > 0;
  useEffect(() => {
    if (!anyWalkers || reduced !== false) return;
    const tick = setInterval(() => setStepFrame((s) => !s), STEP_MS);
    return () => clearInterval(tick);
  }, [anyWalkers, reduced]);

  if (walkers.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {walkers.map((w) => (
        <div
          key={w.id}
          className="absolute"
          style={{
            bottom: 26 + w.bottom,
            left: reduced ? "42%" : undefined,
            transform: `scale(${w.scale})`,
            transformOrigin: "bottom left",
            animation: reduced
              ? undefined
              : `cat-walk ${w.durationMs}ms linear ${w.delayMs}ms forwards`,
            // off-screen until the animation kicks in
            ...(reduced ? {} : { left: "-15%" }),
          }}
        >
          <Sprite frame={stepFrame ? FRAME_B : FRAME_A} flip={false} />
        </div>
      ))}
    </div>
  );
}
