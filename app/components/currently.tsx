"use client";

// first-run seed and outage fallback only: the blob is the source of truth.
// backups/ is refreshed weekly from the live site, so this never needs editing.
import backup from "@/backups/currently.json";
import { useEffect, useState } from "react";
import { useSiteAuth } from "./site-auth";
import { CurrentlyEditor } from "./currently-editor";

const DEFAULT_ITEMS: string[] = backup.items;

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

type Phase = "typing" | "dozing" | "deleting";

const DOZE_CHANCE = 0.15;
const DOZE_TEXT = " z  z  z  z  z";
const DOZE_CHAR_MS = 640;
const DOZE_HOLD_MS = 2200;
type SaveState = "idle" | "saving" | "error";

export function Currently() {
  // deterministic first render (no shuffle) so SSR and hydration match;
  // the queue is shuffled after mount
  const [queue, setQueue] = useState<string[]>(DEFAULT_ITEMS);
  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [reduced, setReduced] = useState<boolean | null>(null);
  const { password } = useSiteAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  // gate [edit] until the blob load settles, or an early save would
  // overwrite the real list with DEFAULT_ITEMS
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // load the shared list; fall back to defaults
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      let next = DEFAULT_ITEMS;
      try {
        const res = await fetch("/api/currently", { cache: "no-store" });
        const json = await res.json();
        if (Array.isArray(json.items) && json.items.length > 0) {
          next = json.items;
        }
      } catch {}
      if (cancelled) return;
      setItems(next);
      setQueue(shuffled(next));
      setIndex(0);
      setText("");
      setPhase("typing");
      setLoaded(true);
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
        // sometimes the cursor falls asleep on the job
        t = setTimeout(
          () => setPhase(Math.random() < DOZE_CHANCE ? "dozing" : "deleting"),
          HOLD_MS
        );
      }
    } else if (phase === "dozing") {
      const dozeTarget = `${full}${DOZE_TEXT}`;
      if (text.length < dozeTarget.length) {
        t = setTimeout(() => setText(dozeTarget.slice(0, text.length + 1)), DOZE_CHAR_MS);
      } else {
        t = setTimeout(() => setPhase("deleting"), DOZE_HOLD_MS);
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
        className="flex items-baseline gap-2 min-w-0 lg:flex-wrap"
        style={{ color: "var(--soft)" }}
        aria-label={`currently: ${queue[index]}`}
      >
        <span style={{ color: "var(--rose)" }} aria-hidden="true">
          ❯
        </span>
        <span className="shrink-0">currently</span>
        {password && loaded && !editing && (
          <button onClick={openEditor} className="tui-btn text-[11px] shrink-0">
            [edit]
          </button>
        )}
        <span
          className="truncate lg:w-full lg:whitespace-normal lg:line-clamp-3"
          style={{ color: "var(--ink)" }}
          aria-hidden="true"
        >
          {reduced === true ? queue[index] : text}
          <span className="cursor-block" />
        </span>
      </span>

      {editing && (
        <CurrentlyEditor
          draft={draft}
          setDraft={setDraft}
          maxLength={ITEM_MAX_LENGTH}
          saveState={saveState}
          onSave={save}
          onCancel={() => setEditing(false)}
        />
      )}
    </span>
  );
}
