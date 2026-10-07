"use client";

import { useRef, useState } from "react";
import { STATUS_LABEL, hashString, lookupUrl, type Book } from "./types";

// same curated muted palette as the guestbook names — the sanctioned exception
const SPINE_COLORS = [
  "#6f8f6a", // moss
  "#9a6a4f", // clay
  "#a8895a", // ochre
  "#5f8a8b", // pond teal
  "#8a7a9e", // wisteria
  "#9d7081", // dusty rose
];

function Spine({
  book,
  selected,
  dropTarget,
  lean,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  book: Book;
  selected: boolean;
  dropTarget: boolean;
  lean: boolean;
  onClick: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const h = hashString(book.title);
  // a spine is at least tall enough for its title (≈6.6px per char at 10px
  // mono, plus padding), otherwise hash-varied like a real shelf; very long
  // titles cap out and take the ellipsis
  const label = book.spine ?? book.title;
  const needed = Math.ceil(24 + label.length * 6.7);
  const height = Math.min(188, Math.max(100 + (h % 5) * 11, needed));
  const width = 24 + ((h >> 4) % 4) * 3; // 24–33, so a full shelf fits one row
  const color = SPINE_COLORS[h % SPINE_COLORS.length];

  return (
    <button
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className="spine relative shrink-0 overflow-hidden"
      data-pulled={selected ? "true" : "false"}
      data-drop-target={dropTarget ? "true" : "false"}
      data-lean={lean ? "true" : "false"}
      style={{
        height,
        width,
        background: color,
        border: selected ? "1px solid var(--ink)" : "1px solid var(--line)",
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
          textOverflow: "ellipsis",
          color: "var(--bg)",
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
          paddingTop: 7,
        }}
        aria-hidden="true"
      >
        {label}
      </span>
    </button>
  );
}

// the pulled book, printed as a tree under the shelf
function Pulled({
  book,
  queueNo,
  owner,
  onMove,
  onEdit,
}: {
  book: Book;
  queueNo: number | null;
  owner: boolean;
  onMove: (delta: -1 | 1) => void;
  onEdit: () => void;
}) {
  const where =
    book.status === "to-read" && queueNo
      ? `queued · no. ${String(queueNo).padStart(2, "0")}`
      : STATUS_LABEL[book.status];
  const branches: [string, React.ReactNode][] = [
    ["by", book.author],
    ["status", where],
  ];
  if (book.tag) branches.push(["track", <span key="t" style={{ color: "var(--accent)" }}>{book.tag}</span>]);
  if (book.note)
    branches.push([
      "note",
      <span key="n" className="comment" style={{ color: "var(--soft)" }}>
        {book.note}
      </span>,
    ]);

  return (
    <div className="mt-5 px-[1ch] text-[13px] leading-[1.75]" aria-live="polite">
      <div className="flex items-baseline gap-[1ch] flex-wrap">
        <span style={{ color: "var(--accent)" }} aria-hidden="true">
          ▹
        </span>
        <span style={{ color: "var(--ink)" }}>{book.title}</span>
      </div>
      <ul className="m-0 p-0 list-none">
        {branches.map(([k, v], i) => (
          <li key={k} className="grid grid-cols-[4ch_7ch_minmax(0,1fr)] gap-x-[1ch]">
            <span style={{ color: "var(--faint)" }} aria-hidden="true">
              {i === branches.length - 1 ? "└──" : "├──"}
            </span>
            <span style={{ color: "var(--faint)" }}>{k}</span>
            <span className="min-w-0 lowercase" style={{ color: "var(--ink)" }}>
              {v}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-3 text-[12px]" style={{ paddingLeft: "5ch" }}>
        <button onClick={() => onMove(-1)} className="tui-btn" aria-label={`move ${book.title} left`}>
          [←]
        </button>
        <button onClick={() => onMove(1)} className="tui-btn" aria-label={`move ${book.title} right`}>
          [→]
        </button>
        <a
          href={lookupUrl(book)}
          target="_blank"
          rel="noopener noreferrer"
          className="tui-btn"
          style={{ textDecoration: "none" }}
        >
          [look it up ↗]
        </a>
        {owner && (
          <button onClick={onEdit} className="tui-btn" aria-label={`edit ${book.title}`}>
            [edit]
          </button>
        )}
      </div>
    </div>
  );
}

export function Shelf({
  books,
  selectedId,
  setSelectedId,
  queueNo,
  owner,
  reorder,
  moveBy,
  onEdit,
  editing,
}: {
  books: Book[];
  selectedId: string | null;
  setSelectedId: (fn: (cur: string | null) => string | null) => void;
  queueNo: Map<string, number>;
  owner: boolean;
  reorder: (movingId: string, targetId: string | null) => void;
  moveBy: (id: string, delta: -1 | 1) => void;
  onEdit: (book: Book) => void;
  editing: React.ReactNode; // the editor, when it was opened from here
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);

  const drop = (targetId: string | null) => {
    const moving = dragIdRef.current;
    dragIdRef.current = null;
    setDragId(null);
    setDropId(null);
    if (moving && moving !== targetId) reorder(moving, targetId);
  };

  const selected = books.find((b) => b.id === selectedId) ?? null;
  // one book always leans; which one depends on the arrangement
  const leanIndex = books.length > 1 ? hashString(books.map((b) => b.id).join()) % books.length : -1;

  if (books.length === 0) {
    return (
      <p className="comment m-0 px-[1ch] text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        the shelf is empty. it won&apos;t last.
      </p>
    );
  }

  return (
    <>
      <div
        className="mt-6 flex flex-wrap items-end gap-[6px] px-1"
        style={{ borderBottom: "1px solid var(--line)" }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          drop(null); // dropped on the shelf itself: move to the end
        }}
      >
        {books.map((book, i) => (
          <Spine
            key={book.id}
            book={book}
            selected={book.id === selectedId}
            dropTarget={dropId === book.id && dragId !== book.id}
            lean={i === leanIndex}
            onClick={() => setSelectedId((cur) => (cur === book.id ? null : book.id))}
            onDragStart={() => {
              dragIdRef.current = book.id;
              setDragId(book.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropId(book.id);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              drop(book.id);
            }}
            onDragEnd={() => {
              dragIdRef.current = null;
              setDragId(null);
              setDropId(null);
            }}
          />
        ))}
      </div>

      {selected && (
        <Pulled
          book={selected}
          queueNo={queueNo.get(selected.id) ?? null}
          owner={owner}
          onMove={(d) => moveBy(selected.id, d)}
          onEdit={() => onEdit(selected)}
        />
      )}
      {editing}

      <p className="comment mt-5 mb-0 px-[1ch] text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        click a spine to pull it off the shelf. drag to rearrange, it soothes.
        the ribbon marks what&apos;s open right now.
      </p>
    </>
  );
}
