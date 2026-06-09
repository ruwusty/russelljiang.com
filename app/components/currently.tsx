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
  "tuning hyperparameters by vibes",
  "bootstrapping confidence (intervals)",
  "praying to the central limit theorem",
  "regularising my personality",
  "sampling energy without replacement",
  "rejecting the null hypothesis of a free weekend",
  "doing the reading (skimming the reading)",
  "rebasing my life onto main",
  "git blame-ing past me",
  "trying to exit vim",
  ":wq",
  "off by one, emotionally",
  "waiting for npm install",
  "renaming variables until it compiles",
  "transposing for the clarinet again",
  "counting rests, mostly",
  "losing an argument with a tuner",
  "buying reeds instead of practising",
  "queueing for the library at 8:59",
  "walking to a lecture i could've streamed",
  "refactoring my notes instead of reading them",
  "alt-tabbing with intent",
];

function shuffled<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const TYPE_MS = 38;
const TYPE_JITTER_MS = 42;
const DELETE_MS = 16;
const HOLD_MS = 2800;
const REDUCED_SWAP_MS = 4200;

type Phase = "typing" | "deleting";

export function Currently() {
  const [queue] = useState(() => shuffled(ITEMS));
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // reduced motion: instant swap, no typing
  useEffect(() => {
    if (reduced !== true) return;
    setText(queue[index]);
    const tick = setInterval(() => {
      setIndex((i) => (i + 1) % queue.length);
    }, REDUCED_SWAP_MS);
    return () => clearInterval(tick);
  }, [reduced, queue, index]);

  // typewriter loop
  useEffect(() => {
    if (reduced !== false) return;
    const full = queue[index];
    let t: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < full.length) {
        t = setTimeout(
          () => setText(full.slice(0, text.length + 1)),
          TYPE_MS + Math.random() * TYPE_JITTER_MS
        );
      } else {
        t = setTimeout(() => setPhase("deleting"), HOLD_MS);
      }
    } else {
      if (text.length > 0) {
        t = setTimeout(() => setText(text.slice(0, -1)), DELETE_MS);
      } else {
        setIndex((i) => (i + 1) % queue.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(t);
  }, [reduced, text, phase, index, queue]);

  return (
    <span
      className="flex items-baseline gap-2 min-w-0"
      style={{ color: "var(--soft)" }}
      aria-label={`currently: ${queue[index]}`}
    >
      <span style={{ color: "var(--green)" }} aria-hidden="true">
        ❯
      </span>
      <span className="shrink-0">currently</span>
      <span className="truncate" style={{ color: "var(--ink)" }} aria-hidden="true">
        {reduced === true ? queue[index] : text}
        <span className="cursor-block" />
      </span>
    </span>
  );
}
