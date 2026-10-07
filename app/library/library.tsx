"use client";

import { useEffect, useState } from "react";
import { useSiteAuth } from "../components/site-auth";
import { BookForm } from "./book-form";
import { Shelf } from "./shelf";
import { EMPTY_DRAFT, type Book, type Draft, type Status } from "./types";
import s from "./library.module.css";

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

// the table's columns: cursor, number, title, author. author folds into a
// line under the title below sm.
const COLS =
  "grid grid-cols-[2ch_minmax(0,1fr)] sm:grid-cols-[1ch_2ch_minmax(0,1fr)_19ch] gap-x-[1ch]";
// lines under a row start under the title: the narrow cells plus their gaps,
// in the head's 13px ch, since those lines are set at 12px
const UNDER_TITLE = "pl-[calc(4ch*13/12)] sm:pl-[calc(6ch*13/12)]";
const SHELF_CELLS = 28;

// ─── header: a fetch-style readout ─────────────────────────────────────────

// one cell per book, in shelf order, while the shelf is small enough;
// past that, the same three runs scaled down
function shelfCells(books: Book[]): Status[] {
  if (books.length <= SHELF_CELLS) return books.map((b) => b.status);
  const order: Status[] = ["reading", "read", "to-read"];
  const out: Status[] = [];
  for (const st of order) {
    const n = Math.round((books.filter((b) => b.status === st).length / books.length) * SHELF_CELLS);
    for (let i = 0; i < n; i++) out.push(st);
  }
  return out.slice(0, SHELF_CELLS);
}

// thin, like the digest's meters: ━ for books opened, ─ for the queue
const CELL: Record<Status, { ch: string; color: string }> = {
  reading: { ch: "━", color: "var(--accent)" },
  read: { ch: "━", color: "var(--soft)" },
  "to-read": { ch: "─", color: "var(--faint)" },
};

function Swatch({ status }: { status: Status }) {
  return (
    <span aria-hidden="true" style={{ color: CELL[status].color }}>
      {CELL[status].ch}{" "}
    </span>
  );
}

function Readout({ books, next }: { books: Book[]; next: Book | null }) {
  const count = (st: Status) => books.filter((b) => b.status === st).length;
  const rows: [string, React.ReactNode][] = [
    [
      "shelf",
      <span key="shelf" className="whitespace-nowrap">
        <span aria-hidden="true">
          {shelfCells(books).map((st, i) => (
            <span key={i} style={{ color: CELL[st].color }}>
              {CELL[st].ch}
            </span>
          ))}
        </span>{" "}
        <span style={{ color: "var(--soft)" }}>{books.length}</span>
      </span>,
    ],
    ["reading", <><Swatch status="reading" />{count("reading")}</>],
    ["queued", <><Swatch status="to-read" />{count("to-read")}</>],
    ["read", <><Swatch status="read" />{count("read")}</>],
    [
      "next",
      next ? (
        <span className="block truncate">{next.title}</span>
      ) : (
        <span style={{ color: "var(--soft)" }}>open to suggestions</span>
      ),
    ],
  ];
  return (
    <dl className="m-0 grid grid-cols-[8ch_minmax(0,1fr)] gap-x-[1ch] text-[13px] leading-[1.75]">
      {rows.map(([key, value]) => (
        <div key={key} className="contents">
          <dt style={{ color: "var(--accent)" }}>{key}</dt>
          <dd className="m-0 min-w-0" style={{ color: "var(--ink)" }}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ─── the table ─────────────────────────────────────────────────────────────

function SectionHead({ id, name, count }: { id?: string; name: string; count: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="m-0 mb-1 px-[1ch] flex items-baseline gap-[1ch] text-[13px] font-normal lowercase tracking-[0.15em]"
      style={{ color: "var(--ink)" }}
    >
      <span style={{ color: "var(--accent)" }}>##</span>
      <span>{name}</span>
      <span className="text-[11px] tracking-normal" style={{ color: "var(--faint)" }}>
        {count}
      </span>
    </h2>
  );
}

function ColumnHeads() {
  return (
    <div
      className={`${COLS} px-[1ch] pb-1 [&>span]:text-[11px] uppercase tracking-[0.08em]`}
      style={{ color: "var(--faint)", borderBottom: "1px solid var(--line)" }}
      aria-hidden="true"
    >
      <span className="hidden sm:block" />
      <span>no</span>
      <span>title</span>
      <span className="hidden sm:inline">author</span>
    </div>
  );
}

function Row({
  book,
  mark,
  owner,
  editing,
  onEdit,
  onPull,
}: {
  book: Book;
  mark: React.ReactNode; // the number cell: a queue position, or ◉
  owner: boolean;
  editing: boolean;
  onEdit: () => void;
  onPull: () => void;
}) {
  const inner = (
    <>
      <span className={`list-head ${COLS} px-[1ch]`}>
        <span className={`${s.ptr} hidden sm:block`} style={{ color: "var(--ink)" }} aria-hidden="true">
          ▹
        </span>
        {mark}
        <span className="min-w-0" style={{ color: "var(--ink)" }}>
          {book.title}
          <span style={{ color: "var(--faint)" }} aria-hidden="true">
            {" "}
            {owner ? "✎" : "↑"}
          </span>
        </span>
        <span className="hidden sm:block truncate lowercase" style={{ color: "var(--soft)" }}>
          {book.author}
        </span>
      </span>
      <span
        className={`sm:hidden block ${UNDER_TITLE} pr-[1ch] text-[12px] leading-[1.75] lowercase`}
        style={{ color: "var(--soft)" }}
      >
        {book.author}
      </span>
      {book.note && (
        <span
          className={`comment block mt-0.5 ${UNDER_TITLE} pr-[1ch] text-[12px] leading-[1.75]`}
          style={{ color: "var(--soft)" }}
        >
          {book.note}
        </span>
      )}
    </>
  );

  // visitors pull the book's spine off the shelf; the owner opens the editor
  return owner ? (
    <button
      onClick={onEdit}
      className={`list-row ${s.bare} px-0 py-2 ${editing ? s.on : ""}`}
      aria-expanded={editing}
      aria-label={`edit ${book.title} by ${book.author}`}
    >
      {inner}
    </button>
  ) : (
    <button
      onClick={onPull}
      className={`list-row ${s.bare} px-0 py-2`}
      aria-label={`pull ${book.title} off the shelf`}
    >
      {inner}
    </button>
  );
}

function No({ n }: { n: number }) {
  return (
    <span style={{ color: "var(--faint)" }} aria-label={`number ${n}`}>
      {String(n).padStart(2, "0")}
    </span>
  );
}

function Ribbon() {
  return (
    <span style={{ color: "var(--accent)" }} aria-label="reading now">
      ◉
    </span>
  );
}

// ─── the page ──────────────────────────────────────────────────────────────

type DraftFrom = "add" | "row" | "shelf";

export function Library() {
  const { password } = useSiteAuth();
  const [books, setBooks] = useState<Book[]>(DEFAULT_BOOKS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [draftFrom, setDraftFrom] = useState<DraftFrom>("add");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">("idle");
  // owner editing is gated until the blob load settles — otherwise an early
  // drag or save would persist DEFAULT_BOOKS over the real shelf
  const [loaded, setLoaded] = useState(false);
  const owner = Boolean(password && loaded);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/library", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && Array.isArray(json.books)) setBooks(json.books);
      } catch {}
      if (!cancelled) setLoaded(true);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = async (next: Book[]) => {
    if (!password || !loaded) return;
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

  // anyone can rearrange the shelf (it's satisfying); only the owner's
  // arrangement persists — visitors' fidgeting resets on reload.
  const commit = (next: Book[]) => (owner ? persist(next) : setBooks(next));

  const reorder = (movingId: string, targetId: string | null) => {
    const moving = books.find((b) => b.id === movingId);
    if (!moving) return;
    const rest = books.filter((b) => b.id !== movingId);
    const found = targetId ? rest.findIndex((b) => b.id === targetId) : -1;
    const at = found < 0 ? rest.length : found;
    commit([...rest.slice(0, at), moving, ...rest.slice(at)]);
  };

  // keyboard/touch fallback for drag: nudge a book one slot along the shelf
  const moveBy = (id: string, delta: -1 | 1) => {
    const from = books.findIndex((b) => b.id === id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= books.length) return;
    const next = [...books];
    next[from] = books[to];
    next[to] = books[from];
    commit(next);
  };

  // the editor's ↑/↓: swap with the neighbour in the same list (the queue's
  // order is its numbering), whatever sits between them on the shelf
  const moveWithin = (id: string, delta: -1 | 1) => {
    const book = books.find((b) => b.id === id);
    if (!book) return;
    const slots = books.flatMap((b, i) => (b.status === book.status ? [i] : []));
    const k = slots.findIndex((i) => books[i].id === id);
    const other = slots[k + delta];
    if (other === undefined) return;
    const next = [...books];
    next[slots[k]] = books[other];
    next[other] = book;
    commit(next);
  };

  const openAdd = () => {
    setDraftFrom("add");
    setDraft({ ...EMPTY_DRAFT });
  };

  const openEdit = (book: Book, from: DraftFrom) => {
    if (draft?.id === book.id && draftFrom === from) {
      setDraft(null); // clicking the open row again closes it
      return;
    }
    setDraftFrom(from);
    setDraft({
      id: book.id,
      title: book.title,
      author: book.author,
      status: book.status,
      tag: book.tag ?? "",
      note: book.note ?? "",
      spine: book.spine ?? "",
    });
  };

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
      ...(draft.spine.trim() ? { spine: draft.spine.trim().slice(0, 40) } : {}),
    };
    const next = draft.id ? books.map((b) => (b.id === draft.id ? book : b)) : [...books, book];
    persist(next);
    setDraft(null);
  };

  const removeDraft = () => {
    if (!draft?.id) return;
    persist(books.filter((b) => b.id !== draft.id));
    setSelectedId(null);
    setDraft(null);
  };

  const form = (from: DraftFrom, id: string | null) =>
    owner && draft && draftFrom === from && draft.id === id ? (
      <BookForm
        draft={draft}
        setDraft={setDraft}
        onSave={saveDraft}
        onCancel={() => setDraft(null)}
        onRemove={draft.id ? removeDraft : undefined}
        onMove={draft.id && from === "row" ? (d) => moveWithin(draft.id!, d) : undefined}
      />
    ) : null;

  const reading = books.filter((b) => b.status === "reading");
  const queue = books.filter((b) => b.status === "to-read");
  const done = books.filter((b) => b.status === "read");
  const queueNo = new Map(queue.map((b, i) => [b.id, i + 1]));

  const rowFor = (book: Book, mark: React.ReactNode) => (
    <div key={book.id}>
      <Row
        book={book}
        mark={mark}
        owner={owner}
        editing={Boolean(draft && draftFrom === "row" && draft.id === book.id)}
        onEdit={() => openEdit(book, "row")}
        onPull={() => {
          setSelectedId(book.id);
          document.getElementById("shelf")?.scrollIntoView({ block: "start" });
        }}
      />
      {form("row", book.id)}
    </div>
  );

  return (
    <div>
      <Readout books={books} next={queue[0] ?? null} />

      {password && (
        <div className="mt-6 px-[1ch] flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[12px] lowercase">
          <span style={{ color: "var(--soft)" }}>
            <span style={{ color: "var(--rose)" }}>❯</span> {loaded ? "owner" : "owner · loading the shelf…"}
          </span>
          {owner && !(draft && draftFrom === "add") && (
            <button onClick={openAdd} className="tui-btn" style={{ color: "var(--rose)" }}>
              [add book]
            </button>
          )}
          {owner && (
            <span style={{ color: "var(--faint)" }}>click a row to edit it</span>
          )}
          <span
            className="text-[11px]"
            style={{ color: saveState === "error" ? "var(--accent)" : "var(--soft)" }}
            aria-live="polite"
          >
            {saveState === "saving" ? "saving…" : saveState === "error" ? "save failed — try again" : ""}
          </span>
        </div>
      )}
      {form("add", null)}

      {/* the shelf first: it is the page's picture, and a row below pulls
          its book here */}
      <section id="shelf" className="mt-10 text-[13px]">
        <SectionHead name="shelf" count={books.length} />
        <Shelf
          books={books}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          queueNo={queueNo}
          owner={owner}
          reorder={reorder}
          moveBy={moveBy}
          onEdit={(b) => openEdit(b, "shelf")}
          editing={selectedId ? form("shelf", selectedId) : null}
        />
      </section>


      {/* reading now: its own pane, the one thing on the shelf that's open */}
      <fieldset id="reading" className="pane mt-10 mx-0 mb-0 px-0 pt-1 pb-2 min-w-0 text-[13px]">
        <legend>
          <span className="key">◉ </span>reading now
          <span className="key"> · {reading.length}</span>
        </legend>
        {reading.length === 0 ? (
          <p className="comment m-0 px-[2ch] py-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
            between books.
          </p>
        ) : (
          <div className="px-[1ch]">{reading.map((b) => rowFor(b, <Ribbon key="r" />))}</div>
        )}
      </fieldset>

      <section id="queue" className="mt-10 text-[13px]">
        <SectionHead
          name="queue"
          count={queue.length}
        />
        {queue.length === 0 ? (
          <p className="comment m-0 px-[1ch] text-[12px] lowercase" style={{ color: "var(--soft)" }}>
            nothing queued. suggestions go in the guestbook.
          </p>
        ) : (
          <>
            <ColumnHeads />
            {queue.map((b) => rowFor(b, <No key="n" n={queueNo.get(b.id) ?? 0} />))}
          </>
        )}
      </section>

      <section id="read" className="mt-10 text-[13px]">
        <SectionHead name="read" count={done.length} />
        {done.length === 0 ? (
          <p
            className="comment m-0 px-[1ch] pt-1 text-[12px] lowercase"
            style={{ color: "var(--soft)", borderTop: "1px solid var(--line)" }}
          >
            nothing finished yet.
          </p>
        ) : (
          <>
            <ColumnHeads />
            {done.map((b, i) => rowFor(b, <No key="n" n={i + 1} />))}
          </>
        )}
      </section>


      <div
        className="mt-10 pt-2 px-[1ch] flex items-baseline justify-between gap-4 text-[11px] lowercase"
        style={{ color: "var(--faint)", borderTop: "1px solid var(--line)" }}
      >
        <span>
          {books.length} books · {reading.length} open · {done.length} read
        </span>
        <span className={`${s.end} normal-case`}>(END)</span>
      </div>
    </div>
  );
}
