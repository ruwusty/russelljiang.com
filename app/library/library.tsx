"use client";

import { useEffect, useState } from "react";
import { useSiteAuth } from "../components/site-auth";

type Status = "reading" | "to-read" | "read";

interface Book {
  id: string;
  title: string;
  author: string;
  status: Status;
  tag?: string;
  note?: string;
}

const SECTIONS: { status: Status; index: string; label: string; empty: string }[] = [
  { status: "reading", index: "01", label: "currently reading", empty: "nothing open. suspicious." },
  { status: "to-read", index: "02", label: "the queue", empty: "the queue is empty. it won't last." },
  { status: "read", index: "03", label: "read", empty: "nothing finished yet. the queue is long." },
];

// first-run seed + outage fallback only — the blob is the source of truth.
// edit on the site while logged in, not here.
const DEFAULT_BOOKS: Book[] = [
  { id: "simulacra", title: "simulacra and simulation", author: "jean baudrillard", status: "reading" },
  { id: "geb", title: "gödel, escher, bach", author: "douglas hofstadter", status: "reading" },
  // the pick-3-next, in order
  { id: "godels-proof", title: "gödel's proof", author: "nagel & newman", status: "to-read", tag: "rigor", note: "short, mechanics of gödel numbering and the actual proof" },
  { id: "posthuman", title: "how we became posthuman", author: "n. katherine hayles", status: "to-read", tag: "bridge", note: "info theory/cybernetics into posthumanism, closest link to baudrillard" },
  { id: "strange-loop", title: "i am a strange loop", author: "douglas hofstadter", status: "to-read", tag: "rigor", note: "his own distilled version of GEB's self-reference argument" },
  // rest of the rigor track
  { id: "forever-undecided", title: "forever undecided", author: "raymond smullyan", status: "to-read", tag: "rigor", note: "the gödel material as logic puzzles, gentler entry" },
  // rest of the bridge track
  { id: "semiotics", title: "a theory of semiotics", author: "umberto eco", status: "to-read", tag: "bridge", note: "rigorous formal treatment of the sign/representation stuff simulacra runs on" },
  { id: "ecology-of-mind", title: "steps to an ecology of mind", author: "gregory bateson", status: "to-read", tag: "bridge", note: "cybernetics, self-referential feedback loops, pushes into systems theory" },
  { id: "origin-of-objects", title: "on the origin of objects", author: "brian cantwell smith", status: "to-read", tag: "bridge", note: "cs/philosophy of what it means for a system to represent something; sits between GEB and baudrillard" },
  { id: "understanding-media", title: "understanding media", author: "marshall mcluhan", status: "to-read", tag: "bridge", note: "proto-baudrillard, media theory angle" },
  // the throughline picks
  { id: "infinity-mind", title: "infinity and the mind", author: "rudy rucker", status: "to-read", tag: "throughline" },
  { id: "chaos", title: "chaos", author: "james gleick", status: "to-read", tag: "throughline" },
  { id: "the-information", title: "the information", author: "james gleick", status: "to-read", tag: "throughline" },
  { id: "number-sense", title: "the number sense", author: "stanislas dehaene", status: "to-read", tag: "throughline" },
  { id: "sync", title: "sync", author: "steven strogatz", status: "to-read", tag: "throughline" },
  { id: "nonlinear-history", title: "a thousand years of nonlinear history", author: "manuel delanda", status: "to-read", tag: "throughline" },
  { id: "consciousness", title: "consciousness explained", author: "daniel dennett", status: "to-read", tag: "throughline" },
];

// same curated muted palette as the guestbook names — the sanctioned exception
const SPINE_COLORS = [
  "#6f8f6a", // moss
  "#9a6a4f", // clay
  "#a8895a", // ochre
  "#5f8a8b", // pond teal
  "#8a7a9e", // wisteria
  "#9d7081", // dusty rose
];

function hashString(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return h;
}

function Spine({
  book,
  selected,
  onClick,
}: {
  book: Book;
  selected: boolean;
  onClick: () => void;
}) {
  const h = hashString(book.title);
  const height = 100 + (h % 5) * 11; // 100–144
  const width = 27 + ((h >> 4) % 4) * 4; // 27–39
  const color = SPINE_COLORS[h % SPINE_COLORS.length];

  return (
    <button
      onClick={onClick}
      className="relative shrink-0 overflow-hidden"
      style={{
        height,
        width,
        background: color,
        border: selected ? "1px solid var(--ink)" : "1px solid var(--line)",
        // a pulled book sits proud of the shelf; instant, no animation
        transform: selected ? "translateY(-8px)" : undefined,
        cursor: "pointer",
        padding: 0,
      }}
      aria-label={`${book.title} · ${book.author}`}
      aria-expanded={selected}
      title={`${book.title} · ${book.author}`}
    >
      {book.status === "reading" && (
        <span
          className="absolute top-0"
          style={{ right: 5, width: 4, height: 16, background: "var(--accent)" }}
          aria-hidden="true"
        />
      )}
      <span
        className="block mx-auto text-[10px] lowercase"
        style={{
          writingMode: "vertical-rl",
          maxHeight: height - 14,
          overflow: "hidden",
          color: "var(--bg)",
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
          paddingTop: 7,
        }}
        aria-hidden="true"
      >
        {book.title}
      </span>
    </button>
  );
}

interface Draft {
  id: string | null; // null = adding new
  title: string;
  author: string;
  status: Status;
  tag: string;
  note: string;
}

const EMPTY_DRAFT: Draft = { id: null, title: "", author: "", status: "to-read", tag: "", note: "" };

const inputStyle = {
  background: "transparent",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  fontFamily: "inherit",
} as const;

export function Library() {
  const { password } = useSiteAuth();
  const [books, setBooks] = useState<Book[]>(DEFAULT_BOOKS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/library", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && Array.isArray(json.books)) setBooks(json.books);
      } catch {}
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = async (next: Book[]) => {
    if (!password) return;
    setBooks(next);
    setSaveState("saving");
    try {
      const res = await fetch("/api/library", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-site-password": password,
        },
        body: JSON.stringify(next),
      });
      setSaveState(res.ok ? "idle" : "error");
    } catch {
      setSaveState("error");
    }
  };

  const openAdd = () => setDraft({ ...EMPTY_DRAFT });

  const openEdit = (book: Book) =>
    setDraft({
      id: book.id,
      title: book.title,
      author: book.author,
      status: book.status,
      tag: book.tag ?? "",
      note: book.note ?? "",
    });

  const saveDraft = () => {
    if (!draft) return;
    const title = draft.title.trim().slice(0, 100);
    const author = draft.author.trim().slice(0, 60);
    if (!title || !author) return;
    const book: Book = {
      id: draft.id ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      title,
      author,
      status: draft.status,
      ...(draft.tag.trim() ? { tag: draft.tag.trim().slice(0, 20) } : {}),
      ...(draft.note.trim() ? { note: draft.note.trim().slice(0, 200) } : {}),
    };
    const next = draft.id
      ? books.map((b) => (b.id === draft.id ? book : b))
      : [...books, book];
    persist(next);
    setDraft(null);
  };

  const removeDraft = () => {
    if (!draft?.id) return;
    persist(books.filter((b) => b.id !== draft.id));
    setSelectedId(null);
    setDraft(null);
  };

  return (
    <div>
      {password && (
        <div className="mb-2 flex items-baseline gap-4 text-[12px]">
          {!draft && (
            <button onClick={openAdd} className="tui-btn text-[12px]" style={{ color: "var(--green)" }}>
              [add book]
            </button>
          )}
          <span
            className="text-[11px] lowercase"
            style={{ color: saveState === "error" ? "var(--accent)" : "var(--faint)" }}
            aria-live="polite"
          >
            {saveState === "saving" ? "saving…" : saveState === "error" ? "save failed — try again" : ""}
          </span>
        </div>
      )}

      {draft && (
        <div
          className="mb-8 p-4 flex flex-col gap-2 text-[12px] lowercase"
          style={{ border: "1px solid var(--line)" }}
        >
          <div className="flex items-center gap-2" style={{ color: "var(--soft)" }}>
            <span style={{ color: "var(--green)" }}>❯</span>
            <span>{draft.id ? "edit book" : "add book"}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="title"
              autoFocus
              className="px-2 py-1 text-[12px] outline-none flex-1 min-w-[200px]"
              style={inputStyle}
              aria-label="title"
            />
            <input
              value={draft.author}
              onChange={(e) => setDraft({ ...draft, author: e.target.value })}
              placeholder="author"
              className="px-2 py-1 text-[12px] outline-none w-[180px]"
              style={inputStyle}
              aria-label="author"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as Status })}
              className="px-2 py-1 text-[12px] outline-none"
              style={{ ...inputStyle, background: "var(--bg)" }}
              aria-label="status"
            >
              <option value="reading">currently reading</option>
              <option value="to-read">the queue</option>
              <option value="read">read</option>
            </select>
            <input
              value={draft.tag}
              onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
              placeholder="tag (optional)"
              className="px-2 py-1 text-[12px] outline-none w-[140px]"
              style={inputStyle}
              aria-label="tag"
            />
            <input
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder="note (optional)"
              className="px-2 py-1 text-[12px] outline-none flex-1 min-w-[200px]"
              style={inputStyle}
              aria-label="note"
            />
          </div>
          <div className="flex justify-between gap-3 mt-1 text-[12px]">
            {draft.id ? (
              <button onClick={removeDraft} className="tui-btn" style={{ color: "var(--accent)" }}>
                [remove]
              </button>
            ) : (
              <span />
            )}
            <span className="flex gap-3">
              <button onClick={() => setDraft(null)} className="tui-btn">
                [cancel]
              </button>
              <button onClick={saveDraft} className="tui-btn" style={{ color: "var(--green)" }}>
                [save]
              </button>
            </span>
          </div>
        </div>
      )}

      {SECTIONS.map(({ status, index, label, empty }) => {
        const shelf = books.filter((b) => b.status === status);
        const selected = shelf.find((b) => b.id === selectedId) ?? null;
        return (
          <section key={status} id={status} className="mt-12 first:mt-0">
            <h2
              className="text-[13px] lowercase tracking-[0.15em]"
              style={{ color: "var(--ink)" }}
            >
              <span style={{ color: "var(--faint)" }}>{index}</span> {label}
            </h2>

            {shelf.length === 0 ? (
              <div
                className="mt-4 pb-2"
                style={{ borderBottom: "1px solid var(--line)" }}
              >
                <p className="text-[12px] lowercase" style={{ color: "var(--faint)" }}>
                  {empty}
                </p>
              </div>
            ) : (
              <div
                className="mt-8 flex flex-wrap items-end gap-[6px] px-1"
                style={{ borderBottom: "1px solid var(--line)" }}
              >
                {shelf.map((book) => (
                  <Spine
                    key={book.id}
                    book={book}
                    selected={book.id === selectedId}
                    onClick={() =>
                      setSelectedId((cur) => (cur === book.id ? null : book.id))
                    }
                  />
                ))}
              </div>
            )}

            {selected && (
              <div className="mt-4 pl-4" style={{ borderLeft: "1px solid var(--line)" }}>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[14px]" style={{ color: "var(--ink)" }}>
                    {selected.title}
                  </span>
                  <span className="text-[12px] lowercase" style={{ color: "var(--soft)" }}>
                    · {selected.author}
                  </span>
                  {selected.tag && (
                    <span className="text-[11px] lowercase" style={{ color: "var(--faint)" }}>
                      [{selected.tag}]
                    </span>
                  )}
                  {password && (
                    <button
                      onClick={() => openEdit(selected)}
                      className="tui-btn text-[11px]"
                      aria-label={`edit ${selected.title}`}
                    >
                      [e]
                    </button>
                  )}
                </div>
                {selected.note && (
                  <p
                    className="mt-1 text-[12px] leading-[1.8] lowercase"
                    style={{ color: "var(--soft)" }}
                  >
                    {selected.note}
                  </p>
                )}
              </div>
            )}
          </section>
        );
      })}

      <p className="mt-10 text-[11px] lowercase" style={{ color: "var(--faint)" }}>
        click a spine to pull it off the shelf.
      </p>
    </div>
  );
}
