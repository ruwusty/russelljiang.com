"use client";

import { DiscordStatus } from "./discord-status";
import { Currently } from "./currently";

export function StatusStrip() {
  return (
    <div className="mt-8 flex flex-col gap-1 text-[12px]">
      <DiscordStatus />
      <Currently />
    </div>
  );
}
