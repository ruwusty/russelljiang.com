"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const LINES = [
  'const site = { aesthetic: "tui x japanese minimal" };',
  'let coffee = brew("stochastic caffeine descent");',
  "function practice(reps) { return reps < 8 ? practice(reps + 1) : rest(); }",
  "// navigate with h j k l — jump words with w b e",
  'import { clarinet, sax, telecaster } from "music";',
  'const interests = ["causal inference", "game theory", "pho"];',
  "if (understanding.diverges()) { debug(student); }",
  "0 and $ jump to line ends; gg and G jump the buffer",
  "export default function russell() { return <Data />; }",
  "two sets of eight, both honest — then :wq and go home",
];

const TARGETS_TO_WIN = 10;
const MIN_TARGET_DISTANCE = 6;
const BEST_KEY = "vim_trial_best";

interface Pos {
  row: number;
  col: number;
}

interface Best {
  time: number;
  keys: number;
}

const isWordChar = (ch: string) => /[A-Za-z0-9_]/.test(ch);

function computeWordStarts(): Pos[] {
  const starts: Pos[] = [];
  LINES.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) {
      if (isWordChar(line[col]) && (col === 0 || !isWordChar(line[col - 1]))) {
        starts.push({ row, col });
      }
    }
  });
  return starts;
}

function computeWordEnds(): Pos[] {
  const ends: Pos[] = [];
  LINES.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) {
      if (isWordChar(line[col]) && (col === line.length - 1 || !isWordChar(line[col + 1]))) {
        ends.push({ row, col });
      }
    }
  });
  return ends;
}

const WORD_STARTS = computeWordStarts();
const WORD_ENDS = computeWordEnds();

const posKey = (p: Pos) => `${p.row}:${p.col}`;
const isAfter = (a: Pos, b: Pos) => a.row > b.row || (a.row === b.row && a.col > b.col);
const distance = (a: Pos, b: Pos) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

function randomTarget(notNear: Pos): Pos {
  const candidates = WORD_STARTS.filter((p) => distance(p, notNear) >= MIN_TARGET_DISTANCE);
  const pool = candidates.length > 0 ? candidates : WORD_STARTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function loadBest(): Best | null {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.time === "number" && typeof parsed?.keys === "number") {
      return parsed;
    }
  } catch {}
  return null;
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

export function VimTrial() {
  const [cursor, setCursor] = useState<Pos>({ row: 0, col: 0 });
  const [target, setTarget] = useState<Pos>(() => randomTarget({ row: 0, col: 0 }));
  const [hits, setHits] = useState(0);
  const [keys, setKeys] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [best, setBest] = useState<Best | null>(null);
  const goalColRef = useRef(0);
  const pendingGRef = useRef(false);

  useEffect(() => {
    setBest(loadBest());
  }, []);

  // live timer
  useEffect(() => {
    if (startedAt === null || finalTime !== null) return;
    const tick = setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 100);
    return () => clearInterval(tick);
  }, [startedAt, finalTime]);

  const restart = useCallback(() => {
    const start = { row: 0, col: 0 };
    setCursor(start);
    setTarget(randomTarget(start));
    setHits(0);
    setKeys(0);
    setStartedAt(null);
    setElapsed(0);
    setFinalTime(null);
    goalColRef.current = 0;
    pendingGRef.current = false;
  }, []);

  const arrive = useCallback(
    (next: Pos, keyCount: number, startTime: number) => {
      if (posKey(next) !== posKey(target)) return;
      const newHits = hits + 1;
      if (newHits >= TARGETS_TO_WIN) {
        const time = (Date.now() - startTime) / 1000;
        setFinalTime(time);
        setHits(newHits);
        const record: Best = { time, keys: keyCount };
        setBest((current) => {
          if (!current || time < current.time) {
            try {
              localStorage.setItem(BEST_KEY, JSON.stringify(record));
            } catch {}
            return record;
          }
          return current;
        });
      } else {
        setHits(newHits);
        setTarget(randomTarget(next));
      }
    },
    [hits, target]
  );

  useEffect(() => {
    const lineLen = (row: number) => LINES[row].length;
    const clampCol = (row: number, col: number) =>
      Math.max(0, Math.min(col, Math.max(lineLen(row) - 1, 0)));

    const move = (key: string): Pos | null => {
      const { row, col } = cursor;
      switch (key) {
        case "h": {
          const c = Math.max(0, col - 1);
          goalColRef.current = c;
          return { row, col: c };
        }
        case "l": {
          const c = clampCol(row, col + 1);
          goalColRef.current = c;
          return { row, col: c };
        }
        case "j": {
          const r = Math.min(LINES.length - 1, row + 1);
          return { row: r, col: clampCol(r, goalColRef.current) };
        }
        case "k": {
          const r = Math.max(0, row - 1);
          return { row: r, col: clampCol(r, goalColRef.current) };
        }
        case "0": {
          goalColRef.current = 0;
          return { row, col: 0 };
        }
        case "$": {
          goalColRef.current = Number.MAX_SAFE_INTEGER;
          return { row, col: clampCol(row, lineLen(row)) };
        }
        case "w": {
          const next = WORD_STARTS.find((p) => isAfter(p, cursor));
          if (!next) return null;
          goalColRef.current = next.col;
          return next;
        }
        case "b": {
          const prev = [...WORD_STARTS].reverse().find((p) => isAfter(cursor, p));
          if (!prev) return null;
          goalColRef.current = prev.col;
          return prev;
        }
        case "e": {
          const next = WORD_ENDS.find((p) => isAfter(p, cursor));
          if (!next) return null;
          goalColRef.current = next.col;
          return next;
        }
        case "G": {
          const r = LINES.length - 1;
          goalColRef.current = 0;
          return { row: r, col: 0 };
        }
        default:
          return null;
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (finalTime !== null) return;
      if (isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key;

      if (key === "g") {
        if (pendingGRef.current) {
          pendingGRef.current = false;
          event.preventDefault();
          event.stopPropagation();
          const start = startedAt ?? Date.now();
          if (startedAt === null) setStartedAt(start);
          const keyCount = keys + 1;
          setKeys(keyCount);
          goalColRef.current = 0;
          const next = { row: 0, col: 0 };
          setCursor(next);
          arrive(next, keyCount, start);
        } else {
          pendingGRef.current = true;
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      pendingGRef.current = false;

      if (!"hjkl0$wbeG".includes(key)) return;

      const next = move(key);
      event.preventDefault();
      event.stopPropagation();
      if (!next) return;

      const start = startedAt ?? Date.now();
      if (startedAt === null) setStartedAt(start);
      const keyCount = keys + 1;
      setKeys(keyCount);
      setCursor(next);
      arrive(next, keyCount, start);
    };

    // capture phase so the site-wide j/k nav never sees game keys
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [cursor, keys, startedAt, finalTime, arrive]);

  const done = finalTime !== null;

  return (
    <div id="trial">
      <div className="flex items-baseline gap-2 text-[12px]" style={{ color: "var(--soft)" }}>
        <span style={{ color: "var(--green)" }}>❯</span>
        <span>
          reach <span style={{ color: "var(--ink)" }}>{TARGETS_TO_WIN}</span> targets — fast, in few keystrokes
        </span>
      </div>

      <div className="mt-2 text-[11px] lowercase" style={{ color: "var(--faint)" }}>
        h j k l · w b e · 0 $ · gg G — the highlighted block is the target
      </div>

      <pre
        className="mt-5 p-4 overflow-x-auto text-[12px] leading-[1.85]"
        style={{ border: "1px solid var(--line)", color: "var(--soft)" }}
        aria-label="vim practice buffer"
      >
        {LINES.map((line, row) => (
          <div key={row}>
            {(line.length > 0 ? line.split("") : [" "]).map((ch, col) => {
              const isCursor = cursor.row === row && cursor.col === col;
              const isTarget = !done && target.row === row && target.col === col;
              return (
                <span
                  key={col}
                  style={
                    isCursor
                      ? { background: "var(--green)", color: "var(--bg)" }
                      : isTarget
                        ? { background: "var(--accent)", color: "var(--bg)" }
                        : undefined
                  }
                >
                  {ch}
                </span>
              );
            })}
          </div>
        ))}
      </pre>

      <div
        className="mt-3 flex items-baseline justify-between gap-4 flex-wrap text-[11px] lowercase"
        style={{ color: "var(--soft)" }}
        aria-live="polite"
      >
        <span className="flex items-baseline gap-3">
          {done ? (
            <span>
              done — <span style={{ color: "var(--green)" }}>{finalTime.toFixed(1)}s</span> ·{" "}
              {keys} keys
            </span>
          ) : (
            <span>
              target {Math.min(hits + 1, TARGETS_TO_WIN)}/{TARGETS_TO_WIN} ·{" "}
              {startedAt ? `${elapsed.toFixed(1)}s` : "timer starts on first key"} · {keys} keys
            </span>
          )}
          <button onClick={restart} className="tui-btn text-[11px]">
            [restart]
          </button>
        </span>
        <span style={{ color: "var(--faint)" }}>
          {best ? `best: ${best.time.toFixed(1)}s · ${best.keys} keys` : "no best yet"}
        </span>
      </div>
    </div>
  );
}
