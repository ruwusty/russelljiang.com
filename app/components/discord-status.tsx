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
  online: "var(--green)",
  idle: "var(--accent)",
  dnd: "var(--accent)",
  offline: "var(--faint)",
};

const STATUS_LABEL: Record<StatusType, string> = {
  online: "online",
  idle: "idle",
  dnd: "do not disturb",
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
  const label =
    listening_to_spotify && spotify
      ? `${spotify.song} — ${spotify.artist}`
      : STATUS_LABEL[discord_status];

  return (
    <span className="flex items-baseline gap-2" style={{ color: "var(--soft)" }}>
      <span style={{ color: "var(--green)" }}>❯</span>
      <span className="shrink-0">status</span>
      <span className="truncate" style={{ color: STATUS_COLOR[discord_status] }}>
        {label}
      </span>
    </span>
  );
}
