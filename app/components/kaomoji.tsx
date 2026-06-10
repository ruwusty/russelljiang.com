"use client";

import { useEffect, useState } from "react";
import { useSiteAuth } from "./site-auth";

const VALUE_MAX = 40;

// one fetch shared by every <Kaomoji> on the page
let cache: Record<string, string> | null = null;
let pending: Promise<Record<string, string>> | null = null;

async function loadSlots(): Promise<Record<string, string>> {
  if (cache) return cache;
  pending ??= fetch("/api/kaomoji", { cache: "no-store" })
    .then((res) => res.json())
    .then((json) => {
      cache =
        json.slots && typeof json.slots === "object" && !Array.isArray(json.slots)
          ? (json.slots as Record<string, string>)
          : {};
      return cache;
    })
    .catch(() => {
      cache = {};
      return cache;
    });
  return pending;
}

interface KaomojiProps {
  slot: string;
  fallback?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Kaomoji({ slot, fallback = "", className, style }: KaomojiProps) {
  const { password } = useSiteAuth();
  const [value, setValue] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSlots().then((slots) => {
      if (!cancelled) setValue(slot in slots ? slots[slot] : fallback);
    });
    return () => {
      cancelled = true;
    };
  }, [slot, fallback]);

  const display = value === null ? fallback : value;

  const save = async () => {
    if (!password || saving) return;
    setSaving(true);
    setError(false);
    const next = draft.trim().slice(0, VALUE_MAX);
    try {
      const res = await fetch("/api/kaomoji", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-site-password": password,
        },
        body: JSON.stringify({ slot, value: next }),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      cache = { ...(cache ?? {}), [slot]: next };
      setValue(next);
      setEditing(false);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  const baseStyle: React.CSSProperties = { color: "var(--faint)", ...style };

  if (!password) {
    if (!display) return null;
    return (
      <span className={className} style={baseStyle} aria-hidden="true">
        {display}
      </span>
    );
  }

  if (editing) {
    return (
      <span className={`inline-flex items-baseline gap-1.5 ${className ?? ""}`} style={style}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          maxLength={VALUE_MAX}
          autoFocus
          placeholder="empty = hidden"
          className="px-1.5 py-0.5 outline-none w-[150px] text-[11px]"
          style={{
            background: "transparent",
            border: "1px solid var(--line)",
            color: "var(--ink)",
            fontFamily: "inherit",
            letterSpacing: "normal",
          }}
          aria-label={`kaomoji for ${slot}`}
        />
        <button onClick={save} className="tui-btn text-[10px]" style={{ color: "var(--green)" }}>
          {saving ? "[…]" : "[ok]"}
        </button>
        <button onClick={() => setEditing(false)} className="tui-btn text-[10px]">
          [x]
        </button>
        {error && (
          <span className="text-[10px]" style={{ color: "var(--accent)" }}>
            failed
          </span>
        )}
      </span>
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(display);
        setEditing(true);
      }}
      className={`tui-btn ${className ?? ""}`}
      style={baseStyle}
      aria-label={`edit kaomoji ${slot}`}
      title={`edit kaomoji: ${slot}`}
    >
      {display || "[+kao]"}
    </button>
  );
}
