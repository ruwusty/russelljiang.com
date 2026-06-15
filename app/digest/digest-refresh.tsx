"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSiteAuth } from "../components/site-auth";

type State = "idle" | "running" | "done" | "error";

// owner-only: regenerate the digest on demand. only renders when logged in.
// authorises via the existing site password (no digest secret in the browser).
export function DigestRefresh() {
  const { password } = useSiteAuth();
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [note, setNote] = useState<string | null>(null);

  if (!password) return null;

  const run = async () => {
    if (state === "running") return;
    setState("running");
    setNote(null);
    try {
      const res = await fetch("/api/cron/digest/trigger", {
        method: "POST",
        headers: { "x-site-password": password },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setNote(typeof json.error === "string" ? json.error : "failed");
        return;
      }
      setState("done");
      setNote(`done · ${json.items ?? 0} items`);
      router.refresh();
    } catch {
      setState("error");
      setNote("failed — try again");
    }
  };

  return (
    <div className="mt-6 flex items-baseline gap-3 text-[12px]">
      <button
        onClick={run}
        disabled={state === "running"}
        className="tui-btn text-[12px]"
        style={{ color: "var(--green)" }}
      >
        {state === "running" ? "[refreshing… ~30s]" : "[refresh digest]"}
      </button>
      {note && (
        <span
          className="text-[11px] lowercase"
          style={{ color: state === "error" ? "var(--accent)" : "var(--faint)" }}
        >
          {note}
        </span>
      )}
    </div>
  );
}
