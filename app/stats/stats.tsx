"use client";

import { useEffect, useState } from "react";

interface SiteStats {
  guestbookEntries: number | null;
  guestbookLatest: string | null;
  vimRuns: number | null;
  vimBest: string | null;
  booksReading: number | null;
  booksQueued: number | null;
  booksRead: number | null;
  currentlyLines: number | null;
  kaomojiSet: number | null;
}

async function fetchJson(path: string): Promise<unknown> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

function daysAgo(iso: string): string {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export function Stats() {
  const [stats, setStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [guestbook, vim, library, currently, kaomoji] = await Promise.allSettled([
        fetchJson("/api/guestbook"),
        fetchJson("/api/vim-scores"),
        fetchJson("/api/library"),
        fetchJson("/api/currently"),
        fetchJson("/api/kaomoji"),
      ]);

      const next: SiteStats = {
        guestbookEntries: null,
        guestbookLatest: null,
        vimRuns: null,
        vimBest: null,
        booksReading: null,
        booksQueued: null,
        booksRead: null,
        currentlyLines: null,
        kaomojiSet: null,
      };

      if (guestbook.status === "fulfilled") {
        const entries = (guestbook.value as { entries?: { ts: string }[] }).entries;
        if (Array.isArray(entries)) {
          next.guestbookEntries = entries.length;
          next.guestbookLatest = entries.length
            ? entries[entries.length - 1].ts
            : null;
        }
      }
      if (vim.status === "fulfilled") {
        const boards = (vim.value as {
          boards?: Record<string, { time: number }[]>;
        }).boards;
        if (boards) {
          const all = Object.values(boards).flat();
          next.vimRuns = all.length;
          next.vimBest = all.length
            ? `${Math.min(...all.map((r) => r.time)).toFixed(1)}s`
            : null;
        }
      }
      if (library.status === "fulfilled") {
        const books = (library.value as { books?: { status: string }[] }).books;
        const shelf = Array.isArray(books) ? books : [];
        next.booksReading = shelf.filter((b) => b.status === "reading").length || null;
        next.booksQueued = shelf.filter((b) => b.status === "to-read").length || null;
        next.booksRead = shelf.filter((b) => b.status === "read").length;
      }
      if (currently.status === "fulfilled") {
        const items = (currently.value as { items?: string[] }).items;
        if (Array.isArray(items)) next.currentlyLines = items.length;
      }
      if (kaomoji.status === "fulfilled") {
        const slots = (kaomoji.value as { slots?: Record<string, string> }).slots;
        if (slots) {
          next.kaomojiSet = Object.values(slots).filter((v) => v.length > 0).length;
        }
      }

      if (!cancelled) setStats(next);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const row = (label: string, value: string | null) => (
    <div className="contents" key={label}>
      <dt className="text-[12px]" style={{ color: "var(--faint)" }}>
        {label}
      </dt>
      <dd style={{ color: value ? "var(--soft)" : "var(--faint)" }}>{value ?? "…"}</dd>
    </div>
  );

  return (
    <div id="numbers">
      <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--soft)" }}>
        <span style={{ color: "var(--green)" }}>❯</span>
        <span>cat /proc/site</span>
      </div>

      <dl
        className="mt-4 text-[13px] grid grid-cols-[160px_1fr] gap-y-1 lowercase"
        style={{ color: "var(--soft)" }}
      >
        {row(
          "guestbook",
          stats?.guestbookEntries === null || !stats
            ? null
            : `${stats.guestbookEntries} signatures${
                stats.guestbookLatest ? ` · latest ${daysAgo(stats.guestbookLatest)}` : ""
              }`
        )}
        {row(
          "vim trial",
          stats?.vimRuns === null || !stats
            ? null
            : `${stats.vimRuns} runs on the boards${stats.vimBest ? ` · fastest ${stats.vimBest}` : ""}`
        )}
        {row(
          "library",
          !stats || stats.booksRead === null
            ? null
            : `${stats.booksReading ?? 0} open · ${stats.booksQueued ?? 0} queued · ${stats.booksRead} read`
        )}
        {row(
          "currently",
          stats?.currentlyLines === null || !stats ? null : `${stats.currentlyLines} rotating lines`
        )}
        {row(
          "kaomoji",
          stats?.kaomojiSet === null || !stats ? null : `${stats.kaomojiSet} of 5 slots occupied`
        )}
        {row("essays", "2 published · 1 draft behind the login")}
        {row("passwords", "1, for everything")}
        {row("analytics", "none. this page is the analytics")}
      </dl>

      <p className="mt-8 text-[11px] lowercase" style={{ color: "var(--faint)" }}>
        the bonsai is not listed. your tree lives in your browser, not my database.
      </p>
    </div>
  );
}
