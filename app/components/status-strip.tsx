"use client";

import { DiscordStatus } from "./discord-status";
import { Currently } from "./currently";

export function StatusStrip() {
  return (
    <div className="mt-1 flex flex-col gap-2 text-[12px]">
      <DiscordStatus />
      <Currently />
    </div>
  );
}
