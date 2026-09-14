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

// same curated muted palette as the guestbook names and library spines —
// the sanctioned exception. each song hashes to its own colour.
const SONG_COLORS = [
  "#6f8f6a", // moss
  "#9a6a4f", // clay
  "#a8895a", // ochre
  "#5f8a8b", // pond teal
  "#8a7a9e", // wisteria
  "#9d7081", // dusty rose
];

function songColor(song: string): string {
  let hash = 0;
  for (const ch of song.toLowerCase()) {
    hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  }
  return SONG_COLORS[hash % SONG_COLORS.length];
}

export function DiscordStatus() {
  const [data, setData] = useState<LanyardData | null>(null);

  // lanyard websocket: presence changes push in real time instead of the
  // old 30s poll, which left the row stale for most of every song
  useEffect(() => {
    let ws: WebSocket | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    let reconnect: ReturnType<typeof setTimeout> | null = null;
    let unmounted = false;

    // one rest fetch for a fast first paint while the socket handshakes
    fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`)
      .then((res) => res.json())
      .then((json) => {
        if (!unmounted && json.success) setData((cur) => cur ?? json.data);
      })
      .catch(() => {});

    const connect = () => {
      if (unmounted) return;
      try {
        ws = new WebSocket("wss://api.lanyard.rest/socket");
      } catch {
        return; // no websocket support — the rest fetch above still painted
      }
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.op === 1) {
            ws?.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } }));
            if (heartbeat) clearInterval(heartbeat);
            heartbeat = setInterval(
              () => ws?.send(JSON.stringify({ op: 3 })),
              msg.d.heartbeat_interval
            );
          } else if (msg.op === 0) {
            setData(msg.d);
          }
        } catch {}
      };
      ws.onclose = () => {
        if (heartbeat) clearInterval(heartbeat);
        heartbeat = null;
        if (!unmounted) reconnect = setTimeout(connect, 5_000);
      };
      ws.onerror = () => ws?.close();
    };
    connect();

    return () => {
      unmounted = true;
      if (heartbeat) clearInterval(heartbeat);
      if (reconnect) clearTimeout(reconnect);
      ws?.close();
    };
  }, []);

  if (!data) return null;

  const { discord_status, listening_to_spotify, spotify } = data;
  const listening = listening_to_spotify && spotify;
  const label = listening
    ? `listening to ${spotify.song} · ${spotify.artist}`
    : STATUS_LABEL[discord_status];
  const color = listening ? songColor(spotify.song) : STATUS_COLOR[discord_status];

  return (
    <span className="flex items-baseline gap-2 xl:flex-wrap" style={{ color: "var(--soft)" }}>
      <span style={{ color: "var(--green)" }}>❯</span>
      <span className="shrink-0">status</span>
      <span
        className="truncate xl:w-full xl:whitespace-normal xl:line-clamp-3"
        style={{ color }}
      >
        {label}
      </span>
    </span>
  );
}
