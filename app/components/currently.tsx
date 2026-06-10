"use client";

import { useEffect, useState } from "react";
import { useSiteAuth } from "./site-auth";

const DEFAULT_ITEMS = [
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
  "upper day, allegedly",
  "lower day (dreading it)",
  "two sets of eight, both honest",
  "progressive overload, statistically significant",
  "failing the last rep on purpose",
  "recovering (this counts as training)",
  "bulking on pho",
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
const ITEM_MAX_LENGTH = 100;

type Phase = "typing" | "deleting";
type SaveState = "idle" | "saving" | "error";

export function Currently() {
  const [queue, setQueue] = useState(() => shuffled(DEFAULT_ITEMS));
  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [reduced, setReduced] = useState<boolean | null>(null);
  const { password } = useSiteAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // load the shared list; fall back to defaults
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/currently", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && Array.isArray(json.items) && json.items.length > 0) {
          setItems(json.items);
          setQueue(shuffled(json.items));
          setIndex(0);
          setText("");
          setPhase("typing");
        }
      } catch {}
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // reduced motion: instant swap, no typing
  useEffect(() => {
    if (reduced !== true) return;
    const tick = setInterval(() => {
      setIndex((i) => (i + 1) % queue.length);
    }, REDUCED_SWAP_MS);
    return () => clearInterval(tick);
  }, [reduced, queue]);

  // typewriter loop
  useEffect(() => {
    if (reduced !== false || editing) return;
    const full = queue[index] ?? "";
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
  }, [reduced, editing, text, phase, index, queue]);

  const openEditor = () => {
    setDraft(items.join("\n"));
    setSaveState("idle");
    setEditing(true);
  };

  const save = async () => {
    const next = draft
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.slice(0, ITEM_MAX_LENGTH));
    if (next.length === 0 || !password) return;
    setSaveState("saving");
    try {
      const res = await fetch("/api/currently", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-site-password": password,
        },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        setSaveState("error");
        return;
      }
      setItems(next);
      setQueue(shuffled(next));
      setIndex(0);
      setText("");
      setPhase("typing");
      setSaveState("idle");
      setEditing(false);
    } catch {
      setSaveState("error");
    }
  };

  return (
    <span className="flex flex-col min-w-0">
      <span
        className="flex items-baseline gap-2 min-w-0"
        style={{ color: "var(--soft)" }}
        aria-label={`currently: ${queue[index]}`}
      >
        <span style={{ color: "var(--green)" }} aria-hidden="true">
          ❯
        </span>
        <span className="shrink-0">currently</span>
        {password && !editing && (
          <button onClick={openEditor} className="tui-btn text-[11px] shrink-0">
            [edit]
          </button>
        )}
        <span className="truncate" style={{ color: "var(--ink)" }} aria-hidden="true">
          {reduced === true ? queue[index] : text}
          <span className="cursor-block" />
        </span>
      </span>

      {editing && (
        <span className="mt-2 flex flex-col gap-1.5">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={10}
            spellCheck={false}
            className="w-full px-2 py-1.5 text-[12px] leading-[1.7] outline-none resize-y"
            style={{
              background: "transparent",
              border: "1px solid var(--line)",
              color: "var(--ink)",
              fontFamily: "inherit",
            }}
            aria-label="currently items, one per line"
          />
          <span className="flex items-baseline gap-3 text-[11px] lowercase" style={{ color: "var(--faint)" }}>
            <button onClick={save} className="tui-btn text-[11px]" style={{ color: "var(--green)" }}>
              {saveState === "saving" ? "[saving…]" : "[save]"}
            </button>
            <button onClick={() => setEditing(false)} className="tui-btn text-[11px]">
              [cancel]
            </button>
            <span>
              one per line · {draft.split("\n").filter((l) => l.trim()).length} lines
            </span>
            {saveState === "error" && (
              <span style={{ color: "var(--accent)" }}>save failed</span>
            )}
          </span>
        </span>
      )}
    </span>
  );
}
