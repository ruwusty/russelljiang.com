"use client";

import type { Draft, Status } from "./types";

const inputStyle = {
  background: "transparent",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  fontFamily: "inherit",
} as const;

// the owner's editor, a pane like any other: focus inside it turns the
// border and legend to the accent, so it reads as the active dialog.
export function BookForm({
  draft,
  setDraft,
  onSave,
  onCancel,
  onRemove,
  onMove,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
  onRemove?: () => void;
  onMove?: (delta: -1 | 1) => void;
}) {
  const ready = draft.title.trim() && draft.author.trim();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="my-2"
    >
      <fieldset className="pane m-0 px-3 pb-3 pt-1 flex flex-col gap-2 text-[12px] lowercase">
        <legend>
          <span className="key">❯ </span>
          {draft.id ? "edit book" : "add book"}
        </legend>
        <div className="flex gap-2 flex-wrap">
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="title"
            autoFocus
            maxLength={100}
            className="px-2 py-1 text-[12px] outline-none flex-1 min-w-[180px]"
            style={inputStyle}
            aria-label="title"
          />
          <input
            value={draft.author}
            onChange={(e) => setDraft({ ...draft, author: e.target.value })}
            placeholder="author"
            maxLength={60}
            className="px-2 py-1 text-[12px] outline-none flex-1 min-w-[140px] sm:flex-none sm:w-[180px]"
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
            <option value="reading">reading now</option>
            <option value="to-read">the queue</option>
            <option value="read">read</option>
          </select>
          <input
            value={draft.tag}
            onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
            placeholder="track (optional)"
            maxLength={20}
            className="px-2 py-1 text-[12px] outline-none flex-1 min-w-[120px] sm:flex-none sm:w-[150px]"
            style={inputStyle}
            aria-label="track"
          />
          <input
            value={draft.spine}
            onChange={(e) => setDraft({ ...draft, spine: e.target.value })}
            placeholder="spine label (if the title won't fit)"
            maxLength={40}
            className="px-2 py-1 text-[12px] outline-none flex-1 min-w-[180px]"
            style={inputStyle}
            aria-label="spine label"
          />
        </div>
        <input
          value={draft.note}
          onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          placeholder="note (optional)"
          maxLength={200}
          className="px-2 py-1 text-[12px] outline-none w-full"
          style={inputStyle}
          aria-label="note"
        />
        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 mt-1 text-[12px]">
          <span className="flex gap-3">
            {onRemove && (
              <button type="button" onClick={onRemove} className="tui-btn" style={{ color: "var(--accent)" }}>
                [remove]
              </button>
            )}
            {onMove && (
              <>
                <button
                  type="button"
                  onClick={() => onMove(-1)}
                  className="tui-btn"
                  aria-label="move up the list"
                >
                  [↑]
                </button>
                <button
                  type="button"
                  onClick={() => onMove(1)}
                  className="tui-btn"
                  aria-label="move down the list"
                >
                  [↓]
                </button>
              </>
            )}
          </span>
          <span className="flex gap-3">
            <button type="button" onClick={onCancel} className="tui-btn">
              [cancel]
            </button>
            <button
              type="submit"
              className="tui-btn"
              style={{ color: ready ? "var(--rose)" : "var(--faint)" }}
              disabled={!ready}
            >
              [save]
            </button>
          </span>
        </div>
      </fieldset>
    </form>
  );
}
