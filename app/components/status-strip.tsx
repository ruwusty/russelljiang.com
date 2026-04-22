"use client";

import { DiscordStatus } from "./discord-status";
import { Currently } from "./currently";

export function StatusStrip() {
  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-5 h-11 overflow-hidden"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--bg) 80%, transparent)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        whiteSpace: "nowrap",
      }}
    >
      <div className="shrink-0">
        <DiscordStatus />
      </div>
      <span className="shrink-0" style={{ color: "var(--border)" }}>·</span>
      <div className="min-w-0 flex-1 overflow-hidden">
        <Currently />
      </div>
    </header>
  );
}
