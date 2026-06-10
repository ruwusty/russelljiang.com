"use client";

import { useEffect, useState } from "react";
import { useSiteAuth } from "./site-auth";

const VALUE_MAX = 40;

const KAOMOJI_OPTIONS = [
  "( ˶ˆᗜˆ˵ )",
  "(˶ᵔ ᵕ ᵔ˶)",
  "(´。• ᵕ •。`)",
  "(≧◡≦)",
  "(◕‿◕)",
  "(*´ω`*)",
  "(˘ω˘)",
  "( ˙꒳˙ )",
  "(o´ω`o)",
  "( ´ ▽ ` )ﾉ",
  "(^_^)/",
  "(￣ー￣)ゞ",
  "(￣^￣)ゞ",
  "(ง •̀_•́)ง",
  "(•̀ᴗ•́)و",
  "(⌐■_■)",
  "(¬‿¬)",
  "(¬_¬\")",
  "(；一_一)",
  "(・_・;)",
  "(？_？)",
  "(T_T)",
  "(╥﹏╥)",
  "¯\\_(ツ)_/¯",
  "(╯°□°)╯︵ ┻━┻",
  "┬─┬ノ( º _ ºノ)",
  "ʕ•ᴥ•ʔ",
  "(ᵔᴥᵔ)",
  "(=^･ω･^=)",
];

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

  const save = async (picked: string) => {
    if (!password || saving) return;
    setSaving(true);
    setError(false);
    const next = picked.trim().slice(0, VALUE_MAX);
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
    const options = KAOMOJI_OPTIONS.includes(display) || !display
      ? KAOMOJI_OPTIONS
      : [display, ...KAOMOJI_OPTIONS];
    return (
      <span className={`inline-flex items-baseline gap-1.5 ${className ?? ""}`} style={style}>
        <select
          value={display}
          onChange={(e) => save(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditing(false);
          }}
          autoFocus
          className="px-1 py-0.5 outline-none text-[11px]"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
            fontFamily: "inherit",
            letterSpacing: "normal",
            maxWidth: "170px",
          }}
          aria-label={`kaomoji for ${slot}`}
          disabled={saving}
        >
          <option value="">(none)</option>
          {options.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <button onClick={() => setEditing(false)} className="tui-btn text-[10px]">
          [x]
        </button>
        {saving && (
          <span className="text-[10px]" style={{ color: "var(--faint)" }}>
            …
          </span>
        )}
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
      onClick={() => setEditing(true)}
      className={`tui-btn ${className ?? ""}`}
      style={baseStyle}
      aria-label={`edit kaomoji ${slot}`}
      title={`edit kaomoji: ${slot}`}
    >
      {display || "[+kao]"}
    </button>
  );
}
