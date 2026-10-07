export type Status = "reading" | "to-read" | "read";

export interface Book {
  id: string;
  title: string;
  author: string;
  status: Status;
  tag?: string;
  note?: string;
  spine?: string; // short label for the spine when the title won't fit
}

export const STATUS_LABEL: Record<Status, string> = {
  reading: "reading now",
  "to-read": "queued",
  read: "read",
};

export interface Draft {
  id: string | null; // null = adding new
  title: string;
  author: string;
  status: Status;
  tag: string;
  note: string;
  spine: string;
}

export const EMPTY_DRAFT: Draft = {
  id: null,
  title: "",
  author: "",
  status: "to-read",
  tag: "",
  note: "",
  spine: "",
};

export function hashString(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return h;
}

// a visitor's way to look a book up. a search, not a store: no affiliate
// anything, and it works for any title the shelf ever holds.
export function lookupUrl(book: Book): string {
  return `https://openlibrary.org/search?q=${encodeURIComponent(`${book.title} ${book.author}`)}`;
}
