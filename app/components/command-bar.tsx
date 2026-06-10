"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Kaomoji } from "./kaomoji";
import { useSiteAuth } from "./site-auth";

const ROUTES: Record<string, string> = {
  home: "/",
  overview: "/",
  writing: "/writing",
  guestbook: "/guestbook",
  plan: "/plan",
  presets: "/presets",
  vim: "/vim",
  projects: "/projects",
};

const EXTERNAL: Record<string, string> = {
  linkedin: "https://linkedin.com/in/russelljiang",
  email: "mailto:russelljiang@pm.me",
};

const HELP_LINES: [string, string][] = [
  ["go <page>", "home · writing · guestbook · vim · projects · plan · presets · linkedin · email"],
  ["vim", "motion practice trial"],
  ["theme [dark|light]", "switch theme"],
  ["login / logout", "関係者以外立入禁止"],
  ["whoami", "introductions"],
  ["q / wq", "you have to try"],
];
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
  const { password, login, logout } = useSiteAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"cmd" | "pw">("cmd");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // restore the cheat across navigations within the session
    try {
      if (sessionStorage.getItem("phosphor") === "1") {
        document.body.classList.add("phosphor");
      }
    } catch {}

    const KONAMI = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    let ki = 0;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHelpOpen(false);
        return;
      }
      if (!isTypingTarget(event.target)) {
        const expected = KONAMI[ki];
        ki =
          event.key === expected || event.key.toLowerCase() === expected
            ? ki + 1
            : event.key === KONAMI[0]
              ? 1
              : 0;
        if (ki === KONAMI.length) {
          ki = 0;
          const on = document.body.classList.toggle("phosphor");
          try {
            sessionStorage.setItem("phosphor", on ? "1" : "");
          } catch {}
          show(on ? "cheat accepted — phosphor mode (⌐■_■)" : "phosphor mode off. welcome back to 2026");
        }
      }
      if (event.key !== ":" || isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      setMessage(null);
      setValue("");
      setMode("cmd");
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const rawArg = rest.join(" ");
    const arg = rawArg.toLowerCase();

    setHelpOpen(false);

    switch (head.toLowerCase()) {
      case "":
        break;
      case "help":
      case "h":
        setHelpOpen(true);
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
        show(
          password
            ? "russell (root) · permissions: all of them"
            : "hello, stranger ( ´ ▽ ` )ﾉ sign the guestbook on your way out"
        );
        break;
      case "login": {
        if (password) {
          show("already logged in (try :logout)");
          break;
        }
        if (!rawArg) {
          return "password" as const;
        }
        login(rawArg).then((err) => {
          show(err ?? "logged in — welcome back, russell");
        });
        break;
      }
      case "logout":
        if (password) {
          logout();
          show("logged out");
        } else {
          show("you weren't logged in");
        }
        break;
      case "guestbook":
        router.push("/guestbook");
        break;
      case "vim":
        router.push("/vim");
        break;
      case "rm": {
        if (/^-rf\s*\/\*?$/.test(arg)) {
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            show("rm: refusing to remove '/': it's load-bearing");
          } else {
            window.dispatchEvent(new Event("site-rm-rf"));
          }
        } else {
          show(`rm: cannot remove '${arg || "<nothing>"}': permission denied`);
        }
        break;
      }
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
      className="relative flex items-center justify-between gap-4 px-3 py-1 text-[11px] lowercase"
      style={{ borderTop: "1px solid var(--line)", color: "var(--soft)" }}
    >
      {helpOpen && (
        <div
          className="absolute left-[-1px] right-[-1px] bottom-full px-4 py-3 text-[11px] lowercase cursor-pointer"
          style={{ background: "var(--bg)", border: "1px solid var(--line)" }}
          onClick={() => setHelpOpen(false)}
          role="dialog"
          aria-label="command help"
        >
          <div className="grid gap-x-5 gap-y-1" style={{ gridTemplateColumns: "max-content 1fr" }}>
            {HELP_LINES.map(([cmd, desc]) => (
              <span key={cmd} className="contents">
                <span style={{ color: "var(--green)" }}>:{cmd}</span>
                <span style={{ color: "var(--soft)" }}>{desc}</span>
              </span>
            ))}
          </div>
          <div className="mt-2" style={{ color: "var(--faint)" }}>
            esc or click to close
          </div>
        </div>
      )}
      <span className="flex items-baseline gap-2 min-w-0 flex-1">
        <span
          className="px-1.5 shrink-0"
          style={{
            background: open ? "var(--accent)" : "var(--green)",
            color: "var(--bg)",
          }}
        >
          {open ? (mode === "pw" ? "login" : "command") : "normal"}
        </span>
        {open ? (
          <span className="flex items-baseline gap-1 flex-1 min-w-0" style={{ color: "var(--ink)" }}>
            {mode === "pw" ? "password:" : ":"}
            <input
              ref={inputRef}
              type={mode === "pw" ? "password" : "text"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (mode === "pw") {
                    const attempt = value;
                    setOpen(false);
                    setMode("cmd");
                    setValue("");
                    if (attempt) {
                      login(attempt).then((err) => {
                        show(err ?? "logged in — welcome back, russell");
                      });
                    }
                  } else if (run(value) === "password") {
                    setMode("pw");
                    setValue("");
                  } else {
                    setOpen(false);
                  }
                } else if (e.key === "Escape") {
                  setOpen(false);
                  setMode("cmd");
                }
              }}
              onBlur={() => {
                setOpen(false);
                setMode("cmd");
              }}
              className={`flex-1 min-w-0 outline-none text-[11px] ${mode === "pw" ? "" : "lowercase"}`}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--ink)",
                fontFamily: "inherit",
                padding: 0,
              }}
              aria-label={mode === "pw" ? "password input" : "command input"}
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
      {!(message && !open) && (
        <span className="shrink-0 text-right flex items-baseline gap-2" style={{ color: "var(--faint)" }}>
          <span>{sections} sections · © 2026 · utf-8</span>
          <Kaomoji slot="statusbar" className="text-[11px]" />
        </span>
      )}
    </footer>
  );
}
