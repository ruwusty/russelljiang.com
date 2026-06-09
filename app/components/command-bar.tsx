"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

const ROUTES: Record<string, string> = {
  home: "/",
  overview: "/",
  writing: "/writing",
  guestbook: "/guestbook",
  plan: "/plan",
  presets: "/presets",
};

const EXTERNAL: Record<string, string> = {
  github: "https://github.com/ruwusty",
  linkedin: "https://linkedin.com/in/russelljiang",
  email: "mailto:russelljiang@pm.me",
};

const HELP = "go <page> · theme [dark|light] · whoami · help · q";
const MESSAGE_MS = 5000;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

export function CommandBar({ sections }: { sections: number }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ":" || isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      setMessage(null);
      setValue("");
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const show = (text: string) => {
    setMessage(text);
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    msgTimerRef.current = setTimeout(() => setMessage(null), MESSAGE_MS);
  };

  const run = (raw: string) => {
    const cmd = raw.trim().replace(/^:+/, "");
    const [head = "", ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ").toLowerCase();

    switch (head.toLowerCase()) {
      case "":
        break;
      case "help":
      case "h":
        show(`commands: ${HELP}`);
        break;
      case "go": {
        if (ROUTES[arg]) {
          router.push(ROUTES[arg]);
        } else if (EXTERNAL[arg]) {
          window.open(
            EXTERNAL[arg],
            EXTERNAL[arg].startsWith("mailto:") ? "_self" : "_blank",
            "noopener,noreferrer"
          );
        } else {
          show(
            `E344: can't find "${arg || "<page>"}" (try: ${[...Object.keys(ROUTES), ...Object.keys(EXTERNAL)].join(" · ")})`
          );
        }
        break;
      }
      case "theme": {
        const next =
          arg === "dark" || arg === "light"
            ? arg
            : resolvedTheme === "dark"
              ? "light"
              : "dark";
        setTheme(next);
        show(`theme set to ${next}`);
        break;
      }
      case "whoami":
        show("russell jiang · data science @ unsw ( ˶ˆᗜˆ˵ )");
        break;
      case "guestbook":
        router.push("/guestbook");
        break;
      case "q":
      case "q!":
      case "qa":
        show("E37: this is not vim");
        break;
      case "wq":
      case "x":
        show("nothing to write. nowhere to quit to.");
        break;
      default:
        show(`E492: not an editor command: ${head}`);
    }
  };

  return (
    <footer
      className="flex items-center justify-between gap-4 px-3 py-1 text-[11px] lowercase"
      style={{ borderTop: "1px solid var(--line)", color: "var(--soft)" }}
    >
      <span className="flex items-baseline gap-2 min-w-0 flex-1">
        <span
          className="px-1.5 shrink-0"
          style={{
            background: open ? "var(--accent)" : "var(--green)",
            color: "var(--bg)",
          }}
        >
          {open ? "command" : "normal"}
        </span>
        {open ? (
          <span className="flex items-baseline flex-1 min-w-0" style={{ color: "var(--ink)" }}>
            :
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setOpen(false);
                  run(value);
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              onBlur={() => setOpen(false)}
              className="flex-1 min-w-0 outline-none text-[11px] lowercase"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--ink)",
                fontFamily: "inherit",
                padding: 0,
              }}
              aria-label="command input"
              autoComplete="off"
              spellCheck={false}
            />
          </span>
        ) : message ? (
          <span className="truncate" style={{ color: "var(--ink)" }} aria-live="polite">
            {message}
          </span>
        ) : (
          <span className="hidden sm:inline truncate" style={{ color: "var(--faint)" }}>
            j/k move · enter open · : for cmd
          </span>
        )}
      </span>
      <span className="shrink-0 text-right" style={{ color: "var(--faint)" }}>
        {sections} sections · © 2026 · utf-8
      </span>
    </footer>
  );
}
