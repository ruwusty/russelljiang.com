"use client";

import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

// the `currently` list outgrew a textarea in a 210px pane, so editing pops a
// dialog over the window instead: a pane like the others, an editor inside
// with vim's `:set number` gutter, and a status line that says what save will
// do. no wrapping, so line n of the gutter is always item n.

const LINE_PX = 20;

export function CurrentlyEditor({
  draft,
  setDraft,
  maxLength,
  saveState,
  onSave,
  onCancel,
}: {
  draft: string;
  setDraft: (v: string) => void;
  maxLength: number;
  saveState: "idle" | "saving" | "error";
  onSave: () => void;
  onCancel: () => void;
}) {
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

  const lines = useMemo(() => draft.split("\n"), [draft]);
  const stats = useMemo(() => {
    const kept = lines.map((l) => l.trim()).filter(Boolean);
    const seen = new Set<string>();
    let dupes = 0;
    for (const l of kept) {
      const k = l.toLowerCase();
      if (seen.has(k)) dupes++;
      seen.add(k);
    }
    return {
      items: kept.length,
      long: kept.filter((l) => l.length > maxLength).length,
      dupes,
    };
  }, [lines, maxLength]);

  // focus the editor, end of text, on open
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
    el.scrollTop = el.scrollHeight;
  }, []);

  // ctrl/cmd+s saves, esc cancels — from anywhere while the dialog is up
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSave, onCancel]);

  const dialog = (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-8"
      style={{ background: "color-mix(in srgb, var(--bg) 70%, transparent)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <fieldset
        className="pane flex flex-col w-full max-w-[760px] h-[78vh] max-h-[680px] px-4 pb-3 pt-1 sm:px-5"
        style={{ background: "var(--bg)", borderColor: "var(--accent)" }}
        role="dialog"
        aria-modal="true"
        aria-label="edit currently"
      >
        <legend>
          <span className="key">[e]</span> edit ~/currently
        </legend>

        <div
          className="mt-2 flex-1 min-h-0 flex text-[12px]"
          style={{ border: "1px solid var(--line)", lineHeight: `${LINE_PX}px` }}
        >
          <div
            ref={gutterRef}
            className="shrink-0 overflow-hidden select-none text-right py-2 pl-2 pr-3"
            style={{ color: "var(--faint)", borderRight: "1px solid var(--line)" }}
            aria-hidden="true"
          >
            {lines.map((l, i) => (
              <div
                key={i}
                style={{
                  height: LINE_PX,
                  color: l.trim().length > maxLength ? "var(--rose)" : undefined,
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <textarea
            ref={areaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onScroll={(e) => {
              if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
            }}
            wrap="off"
            spellCheck={false}
            className="flex-1 min-w-0 py-2 px-3 outline-none resize-none"
            style={{
              background: "transparent",
              color: "var(--ink)",
              fontFamily: "inherit",
              fontSize: 12,
              lineHeight: `${LINE_PX}px`,
              whiteSpace: "pre",
            }}
            aria-label="currently items, one per line"
          />
        </div>

        {/* the status line: what save will do, then the keys */}
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[11px] lowercase" style={{ color: "var(--soft)" }}>
          <span>
            <span style={{ color: "var(--ink)" }}>{stats.items}</span> items
          </span>
          {stats.long > 0 && (
            <span style={{ color: "var(--rose)" }}>
              {stats.long} over {maxLength} chars (cut on save)
            </span>
          )}
          {stats.dupes > 0 && <span style={{ color: "var(--accent)" }}>{stats.dupes} duplicate{stats.dupes === 1 ? "" : "s"}</span>}
          {saveState === "error" && <span style={{ color: "var(--rose)" }}>save failed</span>}
          <span className="ml-auto flex items-baseline gap-3">
            <button onClick={onSave} className="tui-btn text-[11px]" style={{ color: "var(--rose)" }}>
              {saveState === "saving" ? "[saving…]" : "[save]"}
            </button>
            <button onClick={onCancel} className="tui-btn text-[11px]">
              [cancel]
            </button>
            <span className="hidden sm:inline">⌘/ctrl+s · esc</span>
          </span>
        </div>
      </fieldset>
    </div>
  );

  return createPortal(dialog, document.body);
}
