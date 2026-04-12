"use client";

import { useEffect, useState } from "react";

const DISCORD_ID = "431767636876066826";

type StatusType = "online" | "idle" | "dnd" | "offline";

interface LanyardData {
  discord_status: StatusType;
  listening_to_spotify: boolean;
  spotify: {
    song: string;
    artist: string;
  } | null;
}

const STATUS_COLOR: Record<StatusType, string> = {
  online:  "#22c55e",
  idle:    "#f59e0b",
  dnd:     "#ef4444",
  offline: "#6b7280",
};

const STATUS_LABEL: Record<StatusType, string> = {
  online:  "online",
  idle:    "idle",
  dnd:     "do not disturb",
  offline: "offline",
};

export function DiscordStatus() {
  const [data, setData] = useState<LanyardData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch {}
    };
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!data) return null;

  const { discord_status, listening_to_spotify, spotify } = data;
  const color = STATUS_COLOR[discord_status];
  const label =
    listening_to_spotify && spotify
      ? `${spotify.song} — ${spotify.artist}`
      : STATUS_LABEL[discord_status];

  return (
    <span
      className="flex items-center gap-2 text-sm"
      style={{ color: "var(--muted)" }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      <span>{label}</span>
    </span>
  );
}
