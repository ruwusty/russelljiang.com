"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSiteAuth } from "../components/site-auth";

const ALL_LINES = [
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
  "const pho = await broth.simmer({ hours: 12, shortcuts: false });",
  "while (reed.squeaks()) { sand(reed); complain(); }",
  'git commit -m "fix: everything (hopefully)"',
  "SELECT sleep FROM week WHERE assessments = 0; -- 0 rows",
  "const grade = Math.max(actual, expected - disappointment);",
  "for (const rep of [1, 2]) { lift(heavy); rest(180); }",
  "// the metronome is always right. the metronome is always right.",
  'type Weekend = "study" | "practice" | "gym" | never;',
  "def converge(self): return self.loss < yesterday.loss",
  'echo "remember to drink water" >> ~/.bashrc',
];

type Difficulty = "easy" | "normal" | "hard";

const DIFFICULTIES: Record<
  Difficulty,
  { targets: number; minDist: number; maxDist: number; lines: number; blurb: string }
> = {
  easy: {
    targets: 5,
    minDist: 3,
    maxDist: 14,
    lines: 8,
    blurb: "5 targets in a small buffer, always nearby — hjkl is enough",
  },
  normal: {
    targets: 10,
    minDist: 6,
    maxDist: Infinity,
    lines: 14,
    blurb: "10 targets, 14 lines — w and b start to matter",
  },
  hard: {
    targets: 15,
    minDist: 14,
    maxDist: Infinity,
    lines: 20,
    blurb: "15 far targets, 20 lines — buffer jumps or you'll suffer",
  },
};

const DIFFICULTY_KEY = "vim_trial_difficulty";
const NAME_KEY = "vim_trial_name";
const PERSONAL_MAX = 10;
const runsKeyFor = (d: Difficulty) => `vim_trial_runs_${d}`;

interface PersonalRun {
  time: number;
  keys: number;
  ts: string;
}

interface ScoreEntry {
  id: string;
  name: string;
  time: number;
  keys: number;
  ts: string;
}

type Boards = Record<Difficulty, ScoreEntry[]>;

function loadRuns(d: Difficulty): PersonalRun[] {
  try {
    const raw = localStorage.getItem(runsKeyFor(d));
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (r) => typeof r?.time === "number" && typeof r?.keys === "number"
      );
    }
  } catch {}
  return [];
}

function recordRun(d: Difficulty, run: PersonalRun): PersonalRun[] {
  const runs = [...loadRuns(d), run]
    .sort((a, b) => a.time - b.time || a.keys - b.keys)
    .slice(0, PERSONAL_MAX);
  try {
    localStorage.setItem(runsKeyFor(d), JSON.stringify(runs));
  } catch {}
  return runs;
}

interface Pos {
  row: number;
  col: number;
}

const isWordChar = (ch: string) => /[A-Za-z0-9_]/.test(ch);

function computeWordStarts(lines: string[]): Pos[] {
  const starts: Pos[] = [];
  lines.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) {
      if (isWordChar(line[col]) && (col === 0 || !isWordChar(line[col - 1]))) {
        starts.push({ row, col });
      }
    }
  });
  return starts;
}

function computeWordEnds(lines: string[]): Pos[] {
  const ends: Pos[] = [];
  lines.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) {
      if (isWordChar(line[col]) && (col === line.length - 1 || !isWordChar(line[col + 1]))) {
        ends.push({ row, col });
      }
    }
  });
  return ends;
}

interface Buffer {
  lines: string[];
  starts: Pos[];
  ends: Pos[];
}

function buildBuffer(lineCount: number): Buffer {
  const lines = ALL_LINES.slice(0, lineCount);
  return { lines, starts: computeWordStarts(lines), ends: computeWordEnds(lines) };
}

const BUFFERS: Record<Difficulty, Buffer> = {
  easy: buildBuffer(DIFFICULTIES.easy.lines),
  normal: buildBuffer(DIFFICULTIES.normal.lines),
  hard: buildBuffer(DIFFICULTIES.hard.lines),
};

const posKey = (p: Pos) => `${p.row}:${p.col}`;
const isAfter = (a: Pos, b: Pos) => a.row > b.row || (a.row === b.row && a.col > b.col);
const distance = (a: Pos, b: Pos) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

function randomTarget(notNear: Pos, difficulty: Difficulty): Pos {
  const { minDist, maxDist } = DIFFICULTIES[difficulty];
  const starts = BUFFERS[difficulty].starts;
  const candidates = starts.filter((p) => {
    const d = distance(p, notNear);
    return d >= minDist && d <= maxDist;
  });
  const pool = candidates.length > 0 ? candidates : starts;
  return pool[Math.floor(Math.random() * pool.length)];
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
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [cursor, setCursor] = useState<Pos>({ row: 0, col: 0 });
  const [target, setTarget] = useState<Pos>(() => randomTarget({ row: 0, col: 0 }, "easy"));
  const [hits, setHits] = useState(0);
  const [keys, setKeys] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [boards, setBoards] = useState<Boards | null>(null);
  const [boardView, setBoardView] = useState<"global" | "personal">("global");
  const [personal, setPersonal] = useState<PersonalRun[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const { password } = useSiteAuth();
  const goalColRef = useRef(0);
  const pendingGRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(DIFFICULTY_KEY);
    const d: Difficulty =
      saved === "easy" || saved === "normal" || saved === "hard" ? saved : "easy";
    setDifficulty(d);
    setTarget(randomTarget({ row: 0, col: 0 }, d));
    setPersonal(loadRuns(d));
    setPlayerName(localStorage.getItem(NAME_KEY) ?? "");
    fetch("/api/vim-scores", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.boards) setBoards(json.boards);
      })
      .catch(() => {});
  }, []);

  // live timer
  useEffect(() => {
    if (startedAt === null || finalTime !== null) return;
    const tick = setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 100);
    return () => clearInterval(tick);
  }, [startedAt, finalTime]);

  const restart = useCallback(
    (d: Difficulty = difficulty) => {
      const start = { row: 0, col: 0 };
      setCursor(start);
      setTarget(randomTarget(start, d));
      setHits(0);
      setKeys(0);
      setStartedAt(null);
      setElapsed(0);
      setFinalTime(null);
      setSubmitState("idle");
      setSubmittedId(null);
      goalColRef.current = 0;
      pendingGRef.current = false;
    },
    [difficulty]
  );

  const pickDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    setPersonal(loadRuns(d));
    try {
      localStorage.setItem(DIFFICULTY_KEY, d);
    } catch {}
    restart(d);
  };

  const arrive = useCallback(
    (next: Pos, keyCount: number, startTime: number) => {
      if (posKey(next) !== posKey(target)) return;
      const newHits = hits + 1;
      if (newHits >= DIFFICULTIES[difficulty].targets) {
        const time = (Date.now() - startTime) / 1000;
        setFinalTime(time);
        setHits(newHits);
        setPersonal(
          recordRun(difficulty, { time, keys: keyCount, ts: new Date().toISOString() })
        );
      } else {
        setHits(newHits);
        setTarget(randomTarget(next, difficulty));
      }
    },
    [hits, target, difficulty]
  );

  useEffect(() => {
    const buffer = BUFFERS[difficulty];
    const lineLen = (row: number) => buffer.lines[row].length;
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
          const r = Math.min(buffer.lines.length - 1, row + 1);
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
          const next = buffer.starts.find((p) => isAfter(p, cursor));
          if (!next) return null;
          goalColRef.current = next.col;
          return next;
        }
        case "b": {
          const prev = [...buffer.starts].reverse().find((p) => isAfter(cursor, p));
          if (!prev) return null;
          goalColRef.current = prev.col;
          return prev;
        }
        case "e": {
          const next = buffer.ends.find((p) => isAfter(p, cursor));
          if (!next) return null;
          goalColRef.current = next.col;
          return next;
        }
        case "G": {
          const r = buffer.lines.length - 1;
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
  }, [cursor, keys, startedAt, finalTime, arrive, difficulty]);

  const submitScore = async () => {
    if (finalTime === null || submitState === "sending" || submitState === "done") return;
    setSubmitState("sending");
    const name = playerName.replace(/\s+/g, " ").trim().slice(0, 24) || "anon";
    try {
      localStorage.setItem(NAME_KEY, name);
    } catch {}
    try {
      const res = await fetch("/api/vim-scores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, time: finalTime, keys, difficulty }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitState("error");
        return;
      }
      if (json.boards) setBoards(json.boards);
      if (typeof json.id === "string") setSubmittedId(json.id);
      setBoardView("global");
      setSubmitState("done");
    } catch {
      setSubmitState("error");
    }
  };

  const removeEntry = async (id: string) => {
    if (!password) return;
    const res = await fetch("/api/vim-scores", {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        "x-site-password": password,
      },
      body: JSON.stringify({ difficulty, id }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.boards) setBoards(json.boards);
    }
  };

  const done = finalTime !== null;
  const config = DIFFICULTIES[difficulty];
  const globalRows = boards?.[difficulty] ?? [];

  const hint = (() => {
    if (difficulty !== "easy" || done) return null;
    if (target.row === cursor.row) {
      return target.col > cursor.col
        ? "same line, to the right → w hops words, l steps"
        : "same line, to the left → b hops back, h steps";
    }
    const lines = Math.abs(target.row - cursor.row);
    return target.row > cursor.row
      ? `${lines} line${lines > 1 ? "s" : ""} down → press j`
      : `${lines} line${lines > 1 ? "s" : ""} up → press k`;
  })();

  return (
    <div id="trial">
      <div className="flex items-baseline gap-2 text-[12px]" style={{ color: "var(--soft)" }}>
        <span style={{ color: "var(--green)" }}>❯</span>
        <span>
          reach <span style={{ color: "var(--ink)" }}>{config.targets}</span> targets — fast, in few keystrokes
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-3 flex-wrap text-[12px]">
        {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => pickDifficulty(d)}
            className="tui-btn text-[12px]"
            style={{ color: d === difficulty ? "var(--green)" : "var(--soft)" }}
          >
            [{d}]
          </button>
        ))}
        <span className="text-[11px] lowercase" style={{ color: "var(--faint)" }}>
          {config.blurb}
        </span>
      </div>

      <div className="mt-2 text-[11px] lowercase" style={{ color: "var(--faint)" }}>
        the highlighted block is the target — see the guide below if you&apos;re new
      </div>

      <pre
        className="mt-5 p-4 overflow-x-auto text-[12px] leading-[1.85]"
        style={{ border: "1px solid var(--line)", color: "var(--soft)" }}
        aria-label="vim practice buffer"
      >
        {BUFFERS[difficulty].lines.map((line, row) => (
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

      {hint && (
        <div className="mt-2 text-[11px] lowercase" style={{ color: "var(--green)" }}>
          hint: {hint}
        </div>
      )}

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
              target {Math.min(hits + 1, config.targets)}/{config.targets} ·{" "}
              {startedAt ? `${elapsed.toFixed(1)}s` : "timer starts on first key"} · {keys} keys
            </span>
          )}
          <button onClick={() => restart()} className="tui-btn text-[11px]">
            [restart]
          </button>
        </span>
      </div>

      {/* submit finished run */}
      {done && submitState !== "done" && (
        <div className="mt-4 flex items-baseline gap-2 flex-wrap text-[12px]" style={{ color: "var(--soft)" }}>
          <span style={{ color: "var(--green)" }}>❯</span>
          <span className="shrink-0">post to global as</span>
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitScore();
              e.stopPropagation();
            }}
            maxLength={24}
            placeholder="anon"
            className="px-2 py-0.5 text-[12px] outline-none w-[140px]"
            style={{
              background: "transparent",
              border: "1px solid var(--line)",
              color: "var(--ink)",
              fontFamily: "inherit",
            }}
            aria-label="leaderboard name"
          />
          <button
            onClick={submitScore}
            className="tui-btn text-[12px]"
            style={{ color: "var(--green)" }}
          >
            {submitState === "sending" ? "[posting…]" : "[submit]"}
          </button>
          {submitState === "error" && (
            <span className="text-[11px]" style={{ color: "var(--accent)" }}>
              failed — try again
            </span>
          )}
        </div>
      )}

      {/* leaderboards */}
      <div className="mt-10">
        <div className="flex items-baseline gap-3 flex-wrap text-[12px]" style={{ color: "var(--soft)" }}>
          <span style={{ color: "var(--green)" }}>❯</span>
          <span>leaderboard · {difficulty}</span>
          <button
            onClick={() => setBoardView("global")}
            className="tui-btn text-[12px]"
            style={{ color: boardView === "global" ? "var(--green)" : "var(--soft)" }}
          >
            [global]
          </button>
          <button
            onClick={() => setBoardView("personal")}
            className="tui-btn text-[12px]"
            style={{ color: boardView === "personal" ? "var(--green)" : "var(--soft)" }}
          >
            [personal]
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-1 text-[12px]">
          {boardView === "global" ? (
            boards === null ? (
              <span className="text-[11px] lowercase" style={{ color: "var(--faint)" }}>
                loading…
              </span>
            ) : globalRows.length === 0 ? (
              <span className="text-[11px] lowercase" style={{ color: "var(--faint)" }}>
                nobody has posted a {difficulty} run yet. be the first.
              </span>
            ) : (
              globalRows.map((entry, i) => (
                <div
                  key={entry.id}
                  className="group flex items-baseline gap-3"
                  style={{
                    color: entry.id === submittedId ? "var(--accent)" : "var(--soft)",
                  }}
                >
                  <span className="w-[2ch] text-right" style={{ color: "var(--faint)" }}>
                    {i + 1}
                  </span>
                  <span className="min-w-0 truncate" style={{ color: entry.id === submittedId ? "var(--accent)" : "var(--ink)" }}>
                    {entry.name}
                  </span>
                  <span className="ml-auto shrink-0">
                    {entry.time.toFixed(1)}s · {entry.keys} keys
                  </span>
                  {password && (
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="tui-btn text-[11px] opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                      style={{ color: "var(--accent)" }}
                      aria-label={`remove ${entry.name}'s run`}
                    >
                      [rm]
                    </button>
                  )}
                </div>
              ))
            )
          ) : personal.length === 0 ? (
            <span className="text-[11px] lowercase" style={{ color: "var(--faint)" }}>
              no {difficulty} runs on this device yet.
            </span>
          ) : (
            personal.map((run, i) => (
              <div key={`${run.ts}-${i}`} className="flex items-baseline gap-3" style={{ color: "var(--soft)" }}>
                <span className="w-[2ch] text-right" style={{ color: "var(--faint)" }}>
                  {i + 1}
                </span>
                <span style={{ color: "var(--ink)" }}>
                  {run.time.toFixed(1)}s · {run.keys} keys
                </span>
                <span className="ml-auto shrink-0 text-[11px]" style={{ color: "var(--faint)" }}>
                  {run.ts.slice(0, 10)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
