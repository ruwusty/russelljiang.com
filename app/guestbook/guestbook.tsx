"use client";

import { useEffect, useState } from "react";
import { useSiteAuth } from "../components/site-auth";

const NAME_MAX = 24;
const MESSAGE_MAX = 140;

interface Entry {
  id: string;
  name: string;
  message: string;
  ts: string;
}

const inputStyle = {
  background: "transparent",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  fontFamily: "inherit",
} as const;

// muted, paper-friendly tones; same name always hashes to the same colour
const NAME_COLORS = [
  "#6f8f6a", // moss
  "#9a6a4f", // clay
  "#a8895a", // ochre
  "#5f8a8b", // pond teal
  "#8a7a9e", // wisteria
  "#9d7081", // dusty rose
];

function nameColor(name: string): string {
  let hash = 0;
  for (const ch of name.toLowerCase()) {
    hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  }
  return NAME_COLORS[hash % NAME_COLORS.length];
}

export function Guestbook() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { password } = useSiteAuth();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/guestbook", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && Array.isArray(json.entries)) {
          setEntries([...json.entries].reverse());
        }
      } catch {
        if (!cancelled) setEntries([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sign = async () => {
    const trimmed = message.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: trimmed, website }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "something broke");
        return;
      }
      if (json.entry) {
        setEntries((current) => [json.entry, ...(current ?? [])]);
        setMessage("");
      }
    } catch {
      setError("something broke — try again");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!password) return;
    const res = await fetch("/api/guestbook", {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        "x-site-password": password,
      },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setEntries((current) => (current ?? []).filter((e) => e.id !== id));
    }
  };

  return (
    <>
      {/* sign */}
      <div id="sign" className="flex flex-col gap-2 text-[12px]" style={{ color: "var(--soft)" }}>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span style={{ color: "var(--green)" }}>❯</span>
          <span className="shrink-0">name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={NAME_MAX}
            placeholder="anon"
            className="px-2 py-0.5 text-[12px] outline-none w-[140px]"
            style={inputStyle}
            aria-label="your name"
          />
        </div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span style={{ color: "var(--green)" }}>❯</span>
          <span className="shrink-0">message</span>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sign();
            }}
            maxLength={MESSAGE_MAX}
            placeholder="say something"
            className="px-2 py-0.5 text-[12px] outline-none flex-1 min-w-[200px]"
            style={inputStyle}
            aria-label="your message"
          />
          <button
            onClick={sign}
            disabled={submitting || !message.trim()}
            className="tui-btn text-[12px]"
            style={{ color: message.trim() ? "var(--green)" : "var(--faint)" }}
          >
            {submitting ? "[signing…]" : "[sign]"}
          </button>
        </div>
        {/* honeypot — humans never see this */}
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ display: "none" }}
        />
        <div className="flex items-baseline justify-between text-[11px]" style={{ color: "var(--faint)" }}>
          <span>{error ? <span style={{ color: "var(--accent)" }}>{error}</span> : "be nice. 140 chars."}</span>
          <span>
            {message.length}/{MESSAGE_MAX}
          </span>
        </div>
      </div>

      {/* entries */}
      <div id="entries" className="mt-12">
        <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--soft)" }}>
          <span style={{ color: "var(--green)" }}>❯</span>
          <span>cat guestbook.log</span>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-[13px]">
          {entries === null ? (
            <span className="text-[12px] lowercase" style={{ color: "var(--faint)" }}>
              loading…
            </span>
          ) : entries.length === 0 ? (
            <span className="text-[12px] lowercase" style={{ color: "var(--faint)" }}>
              the log is empty. be the first.
            </span>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="group flex items-baseline gap-2 leading-[1.7]">
                <span className="shrink-0 text-[11px]" style={{ color: "var(--faint)" }}>
                  [{entry.ts.slice(0, 10)}]
                </span>
                <span className="min-w-0">
                  <span style={{ color: nameColor(entry.name) }}>{entry.name}</span>
                  <span style={{ color: "var(--faint)" }}>: </span>
                  <span style={{ color: "var(--ink)" }}>{entry.message}</span>
                </span>
                {password && (
                  <button
                    onClick={() => remove(entry.id)}
                    className="tui-btn text-[11px] ml-auto opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    style={{ color: "var(--accent)" }}
                    aria-label={`remove entry by ${entry.name}`}
                  >
                    [rm]
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
