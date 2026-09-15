"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Kaomoji } from "./kaomoji";
import { useSiteAuth } from "./site-auth";
import { grepPosts, posts, type Post } from "../lib/posts";

// the command line moved from the bottom of the pane to the top (russell, 15
// sep 2026: "the command bar at the bottom makes it more a side feature").
// vim keeps its command line at the bottom, but on a web page the bottom edge
// of a bordered pane reads as a footer, and a footer is where the eye learns
// not to look. so: the PROMPT sits under the crumb where the eye lands and is
// the one input; the STATUS BAR stays at the bottom and carries no input at
// all — mode, ruler. shell layout, not vim layout.
//
// a command's output prints directly under the prompt, like stdout, and stays
// there until the next command, esc, or `clear` (russell, 15 sep: "the output
// is at the bottom for some reason not where the command line is"). it used
// to flash in the status bar for five seconds; a shell does not do that.
//
// the caret is a CELL, not a line: the character under it in inverse video,
// blinking. a native <input> can only draw a thin bar, so the value is drawn
// as text and the real input is stacked invisibly on top — focus, keyboard,
// ime and screen readers all still talk to the real thing. tab completion is
// fish-style: the best match is drawn as ghost text after the caret and tab
// (or → at the end of the line) takes it; the candidates sit on the line
// below so a visitor who has never seen a shell can read the menu.
//
// on first visit to the home page the prompt types `cat ~/about.md`, the
// content reveals beneath it, and the prompt clears to `❯ █` — the way a
// shell looks after a command returns. that demo is the entire onboarding:
// a visitor who has watched it knows the syntax without a tooltip.

const ROUTES: Record<string, string> = {
  home: "/",
  overview: "/",
  about: "/",
  writing: "/writing",
  digest: "/digest",
  library: "/library",
  guestbook: "/guestbook",
  plan: "/plan",
  presets: "/presets",
  vim: "/vim",
  bonsai: "/bonsai",
  projects: "/projects",
  stats: "/stats",
};

const EXTERNAL: Record<string, string> = {
  linkedin: "https://linkedin.com/in/russelljiang",
  email: "mailto:russelljiang@pm.me",
};

const PAGES = Object.keys(ROUTES).filter((k) => k !== "overview" && k !== "about");

const HELP_LINES: [string, string][] = [
  ["ls", "list pages"],
  ["cat <page>", "open one · " + [...PAGES, ...Object.keys(EXTERNAL)].join(" · ")],
  ["grep <term>", "search the writing"],
  ["go <page>", "same as cat, for the vim-minded"],
  ["vim", "motion practice trial"],
  ["theme [dark|light]", "switch theme"],
  ["tea [min]", "a timer, for tea"],
  ["login / logout", "関係者以外立入禁止"],
  ["whoami", "introductions"],
  ["q / wq", "you have to try"],
];

// tab completion tables. primary names only — aliases (`go`, `dir`, `h`)
// still run, they just are not suggested.
const COMMANDS = ["ls", "cat", "grep", "help", "theme", "tea", "whoami", "login", "logout", "vim", "clear"];
const TARGETS = [...PAGES, ...Object.keys(EXTERNAL)];
const TAGS = [...new Set(posts.filter((p) => p.href).flatMap((p) => p.tags))].sort();
const ARGS: Record<string, string[]> = {
  cat: TARGETS,
  go: TARGETS,
  open: TARGETS,
  cd: TARGETS,
  theme: ["dark", "light"],
  grep: TAGS,
  tea: ["3", "5", "stop"],
};

/** the candidates for the current line, and the text that would finish it. */
function complete(value: string): { candidates: string[]; ghost: string } {
  const v = value.toLowerCase();
  const sp = v.indexOf(" ");
  const [pool, prefix] =
    sp === -1
      ? [COMMANDS, v]
      : [ARGS[v.slice(0, sp)] ?? [], v.slice(sp + 1)];
  const candidates = pool.filter((c) => c.startsWith(prefix));
  const ghost = candidates[0] && candidates[0] !== prefix ? candidates[0].slice(prefix.length) : "";
  return { candidates, ghost };
}

// the intro. one command, typed once, then the prompt clears. timing follows
// `currently.tsx` so the two typewriters on the site feel like one hand.
const INTRO_CMD = "cat ~/about.md";
const INTRO_KEY = "rj:intro";
const TYPE_MS = 38;
const TYPE_JITTER_MS = 42;
const INTRO_HOLD_MS = 260;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

/* ------------------------------------------------------------ context */

interface CommandState {
  value: string;
  setValue: (v: string) => void;
  mode: "cmd" | "pw";
  focused: boolean;
  setFocused: (f: boolean) => void;
  message: string | null;
  helpOpen: boolean;
  setHelpOpen: (o: boolean) => void;
  results: Post[] | null;
  setResults: (r: Post[] | null) => void;
  teaUntil: number | null;
  ruler: string;
  submit: () => void;
  cancel: () => void;
  focusPrompt: (prefill?: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  intro: "idle" | "typing" | "done";
}

const Ctx = createContext<CommandState | null>(null);

function useCommand(): CommandState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCommand outside CommandProvider");
  return ctx;
}

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { password, login, logout } = useSiteAuth();

  const [value, setValue] = useState("");
  const [mode, setMode] = useState<"cmd" | "pw">("cmd");
  const [focused, setFocused] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [results, setResults] = useState<Post[] | null>(null);
  const [teaUntil, setTeaUntil] = useState<number | null>(null);
  const [, forceTick] = useState(0);
  const [ruler, setRuler] = useState("all");
  const [intro, setIntro] = useState<"idle" | "typing" | "done">("idle");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // output stays put until something replaces or clears it — see the header.
  const show = useCallback((text: string) => setMessage(text), []);

  const focusPrompt = useCallback((prefill?: string) => {
    setResults(null);
    setMode("cmd");
    if (prefill !== undefined) setValue(prefill);
    // next frame: the input may be re-rendering from a state change above
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      const n = el.value.length;
      el.setSelectionRange(n, n);
    });
  }, []);

  // ---- intro: type the first command into the prompt, then clear it ----
  // the pre-paint script in layout.tsx sets html[data-intro="pending"] on a
  // first visit to `/` (not under reduced-motion), and globals.css hides
  // `.intro-content` while that attribute is present. so the content is in
  // the ssr html for seo, invisible for the ~0.9s of the type, then shown.
  // nothing is fetched behind the animation.
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "pending" || pathname !== "/") return;

    let cancelled = false;
    let i = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    setIntro("typing");
    root.dataset.intro = "typing";

    const finish = (e?: Event) => {
      if (cancelled) return;
      cancelled = true;
      // the keystroke or click that skipped the intro must not ALSO be
      // handled by anything else — `j` is the sidebar's next-item binding and
      // `/` focuses the prompt. capture-phase registration alone does not
      // prevent that (measured: `j` skipped the intro and moved the sidebar
      // selection 0 -> 1); the event has to be stopped here, before it
      // proceeds to the bubble-phase listeners on the same window.
      if (e) {
        e.stopPropagation();
        // keyboard only: a `/` must not also open the browser's quick-find.
        // a click that skips the intro keeps its default — if it landed on a
        // sidebar link, navigating is exactly what the visitor asked for.
        if (e.type === "keydown") e.preventDefault();
      }
      if (timer) clearTimeout(timer);
      delete root.dataset.intro;
      setValue("");
      setIntro("done");
      try {
        localStorage.setItem(INTRO_KEY, "1");
      } catch {}
      window.removeEventListener("keydown", finish, true);
      window.removeEventListener("pointerdown", finish, true);
    };

    const step = () => {
      if (cancelled) return;
      i += 1;
      setValue(INTRO_CMD.slice(0, i));
      if (i >= INTRO_CMD.length) {
        timer = setTimeout(finish, INTRO_HOLD_MS);
        return;
      }
      timer = setTimeout(step, TYPE_MS + Math.random() * TYPE_JITTER_MS);
    };

    // any key or click skips straight to the content. capture phase so we run
    // first; finish() then stops the event so it cannot reach j/k or `/`.
    window.addEventListener("keydown", finish, true);
    window.addEventListener("pointerdown", finish, true);
    timer = setTimeout(step, 180);

    return () => {
      if (!cancelled) {
        if (timer) clearTimeout(timer);
        window.removeEventListener("keydown", finish, true);
        window.removeEventListener("pointerdown", finish, true);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // vim's ruler: where you are in the buffer
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) setRuler("all");
      else if (window.scrollY <= 2) setRuler("top");
      else if (window.scrollY >= max - 2) setRuler("bot");
      else setRuler(`${Math.round((window.scrollY / max) * 100)}%`);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // global keys: `:` focuses the prompt (vim), `/` focuses it with `grep `
  // (vim's search), esc closes overlays, konami toggles phosphor.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("phosphor") === "1") {
        document.body.classList.add("phosphor");
      }
    } catch {}

    const KONAMI = [
      "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
      "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a",
    ];
    let ki = 0;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHelpOpen(false);
        setResults(null);
        setMessage(null);
        return;
      }
      if (isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

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
        return;
      }

      if (event.key === ":") {
        event.preventDefault();
        focusPrompt("");
      } else if (event.key === "/") {
        event.preventDefault();
        focusPrompt("grep ");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusPrompt, show]);

  // the kettle
  useEffect(() => {
    if (teaUntil === null) return;
    const tick = setInterval(() => {
      if (Date.now() >= teaUntil) {
        setTeaUntil(null);
        show("the tea is ready ( ˘ω˘ )");
        if (document.hidden) {
          const original = document.title;
          document.title = "( tea is ready ) — russell jiang";
          const restore = () => {
            document.title = original;
            document.removeEventListener("visibilitychange", restore);
          };
          document.addEventListener("visibilitychange", restore);
        }
      } else {
        forceTick((n) => n + 1);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [teaUntil, show]);

  const open = (arg: string) => {
    if (ROUTES[arg]) {
      router.push(ROUTES[arg]);
      return true;
    }
    if (EXTERNAL[arg]) {
      window.open(
        EXTERNAL[arg],
        EXTERNAL[arg].startsWith("mailto:") ? "_self" : "_blank",
        "noopener,noreferrer"
      );
      return true;
    }
    return false;
  };

  const run = (raw: string): "password" | void => {
    const cmd = raw.trim().replace(/^:+/, "");
    const [head = "", ...rest] = cmd.split(/\s+/);
    const rawArg = rest.join(" ");
    const arg = rawArg.toLowerCase();

    setHelpOpen(false);
    setResults(null);

    switch (head.toLowerCase()) {
      case "":
        break;
      case "help":
      case "h":
      case "man":
        setHelpOpen(true);
        break;
      case "ls":
      case "dir":
        show(`${[...PAGES, ...Object.keys(EXTERNAL)].join("  ")}`);
        break;
      case "cat":
      case "go":
      case "open":
      case "cd": {
        // `cat` with nothing, `.`, or `~` reads as "where am i" — home.
        const target = arg === "" || arg === "." || arg === "~" ? "home" : arg.replace(/^~?\/|\.md$/g, "");
        if (target === "./this-page" || target === "this-page") {
          router.push("/404");
          break;
        }
        if (!open(target)) {
          show(`cat: ${arg || "<page>"}: no such file (try :ls)`);
        }
        break;
      }
      case "grep": {
        if (!rawArg) {
          show("usage: grep <term> — searches the writing");
          break;
        }
        const hits = grepPosts(rawArg);
        if (hits.length === 0) {
          show(`grep: no matches for "${rawArg}"`);
        } else if (hits.length === 1 && hits[0].href) {
          router.push(hits[0].href);
        } else {
          setResults(hits);
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
        if (!rawArg) return "password";
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
      case "digest":
      case "library":
      case "stats":
      case "vim":
        open(head.toLowerCase());
        break;
      case "tea": {
        if (arg === "stop" || arg === "off") {
          if (teaUntil) {
            setTeaUntil(null);
            show("kettle off.");
          } else {
            show("no tea was brewing.");
          }
          break;
        }
        const minutes = arg ? parseFloat(arg) : 3;
        if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 120) {
          show("usage: tea [minutes] — between 0 and 120, be reasonable");
          break;
        }
        setTeaUntil(Date.now() + minutes * 60_000);
        show(`tea brewing — ${minutes} min`);
        break;
      }
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
      case "sudo":
        show("russell is not in the sudoers file. this incident will be reported.");
        break;
      case "clear":
        setMessage(null);
        break;
      default:
        show(`E492: not an editor command: ${head}`);
    }
  };

  const submit = () => {
    if (intro === "typing") return;
    if (mode === "pw") {
      const attempt = value;
      setMode("cmd");
      setValue("");
      inputRef.current?.blur();
      if (attempt) {
        login(attempt).then((err) => {
          show(err ?? "logged in — welcome back, russell");
        });
      }
      return;
    }
    if (run(value) === "password") {
      setMode("pw");
      setValue("");
      return;
    }
    setValue("");
    inputRef.current?.blur();
  };

  const cancel = () => {
    setMode("cmd");
    setValue("");
    setHelpOpen(false);
    setResults(null);
    setMessage(null);
    inputRef.current?.blur();
  };

  return (
    <Ctx.Provider
      value={{
        value, setValue, mode, focused, setFocused, message,
        helpOpen, setHelpOpen, results, setResults, teaUntil, ruler,
        submit, cancel, focusPrompt, inputRef, intro,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

/* ------------------------------------------------------------- prompt */

/** the command line. lives under the crumb, on every page. */
export function Prompt() {
  const c = useCommand();
  const typing = c.intro === "typing";
  const pw = c.mode === "pw";
  const [caret, setCaret] = useState(0);
  const sync = (e: React.SyntheticEvent<HTMLInputElement>) =>
    setCaret(e.currentTarget.selectionStart ?? e.currentTarget.value.length);

  const display = pw ? "•".repeat(c.value.length) : c.value.toLowerCase();
  // the cell sits at the caret while typing here; at the end otherwise (the
  // intro, or the resting prompt) so it reads as a prompt, not a text field.
  const at = c.focused && !typing ? Math.min(caret, display.length) : display.length;
  const completing = c.focused && !typing && !pw;
  const { candidates, ghost: rawGhost } = completing ? complete(c.value) : { candidates: [], ghost: "" };
  // an empty prompt lists the menu; it does not guess. and a caret mid-line
  // means the visitor is editing, not finishing — no ghost there either.
  const ghost = c.value !== "" && at === display.length ? rawGhost : "";
  const withArgs = (cmd: string) => (ARGS[cmd] ? `${cmd} ` : cmd);

  const accept = () => {
    const next = c.value + ghost;
    const done = c.value.includes(" ") ? next : withArgs(next);
    c.setValue(done);
    setCaret(done.length);
  };
  const pick = (candidate: string) => {
    const sp = c.value.indexOf(" ");
    const done = sp === -1 ? withArgs(candidate) : `${c.value.slice(0, sp)} ${candidate}`;
    c.setValue(done);
    setCaret(done.length);
    c.focusPrompt();
  };

  return (
    <div className="relative mt-2">
      <label
        // min-h-6 (24px): the tap target floor. the row's natural height at
        // 12px type is 23px, and the label is what a thumb lands on.
        className="flex items-baseline gap-2 text-[12px] min-h-6"
        style={{ color: "var(--ink)" }}
      >
        <span style={{ color: "var(--green)" }} aria-hidden="true">
          {pw ? "password:" : "❯"}
        </span>
        <span className="sr-only">{pw ? "password" : "command"}</span>
        <span className="relative block min-w-0 flex-1">
          {/* ponytail: the drawn line does not scroll with the real input,
              so a command wider than the pane clips. commands are short. */}
          <span className="block overflow-hidden whitespace-pre" aria-hidden="true">
            {display.slice(0, at)}
            <span className={`caret-cell${display[at] === undefined && ghost ? " ghost" : ""}`}>
              {display[at] ?? ghost[0] ?? " "}
            </span>
            {display.slice(at + 1)}
            {ghost.length > 1 && <span style={{ color: "var(--faint)" }}>{ghost.slice(1)}</span>}
          </span>
          <input
            ref={c.inputRef}
            type={pw ? "password" : "text"}
            value={c.value}
            readOnly={typing}
            onChange={(e) => {
              c.setValue(e.target.value);
              sync(e);
            }}
            onSelect={sync}
            onKeyUp={sync}
            onFocus={(e) => {
              c.setFocused(true);
              sync(e);
            }}
            onBlur={() => c.setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                c.submit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                c.cancel();
              } else if (ghost && (e.key === "Tab" || e.key === "ArrowRight") && !e.shiftKey) {
                e.preventDefault();
                accept();
              }
            }}
            // stacked over the drawn line, invisible: the browser still owns
            // focus, the caret position, the keyboard and the ime.
            className="absolute inset-0 w-full h-full opacity-0 outline-none text-[12px]"
            style={{ fontFamily: "inherit", padding: 0, border: "none", background: "transparent" }}
            aria-label={pw ? "password" : "command — type help for the list, tab to complete"}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
        </span>
      </label>

      {/* stdout. always in the tree so the live region is there before the
          first message lands — a region added with its content is not read. */}
      <div className="text-[12px] lowercase whitespace-pre-wrap" aria-live="polite">
        {c.message}
      </div>

      {candidates.length > 0 && (
        <div
          className="flex flex-wrap gap-x-3 gap-y-0 text-[11px] lowercase"
          style={{ color: "var(--soft)" }}
          aria-label="completions"
        >
          {candidates.map((cand, i) => (
            <button
              key={cand}
              type="button"
              className="tui-btn min-h-6"
              // mousedown, not click: a click would blur the input first and
              // the row would be gone before the click landed
              onMouseDown={(e) => {
                e.preventDefault();
                pick(cand);
              }}
              style={i === 0 && ghost ? { color: "var(--ink)" } : undefined}
            >
              {cand}
            </button>
          ))}
        </div>
      )}

      {c.helpOpen && (
        <div
          className="absolute left-0 right-0 top-full z-20 mt-2 px-4 py-3 text-[11px] lowercase cursor-pointer"
          style={{ background: "var(--bg)", border: "1px solid var(--line)" }}
          onClick={() => c.setHelpOpen(false)}
          role="dialog"
          aria-label="command help"
        >
          <div className="grid gap-x-5 gap-y-1" style={{ gridTemplateColumns: "max-content 1fr" }}>
            {HELP_LINES.map(([cmd, desc]) => (
              <span key={cmd} className="contents">
                <span style={{ color: "var(--green)" }}>{cmd}</span>
                <span style={{ color: "var(--soft)" }}>{desc}</span>
              </span>
            ))}
          </div>
          <div className="mt-2" style={{ color: "var(--soft)" }}>
            : or / to focus · esc or click to close
          </div>
        </div>
      )}

      {c.results && (
        <div
          className="absolute left-0 right-0 top-full z-20 mt-2 px-4 py-3 text-[12px] lowercase"
          style={{ background: "var(--bg)", border: "1px solid var(--line)" }}
          role="dialog"
          aria-label="grep results"
        >
          <div className="text-[11px] mb-2" style={{ color: "var(--soft)" }}>
            {c.results.length} match{c.results.length === 1 ? "" : "es"}
          </div>
          <ul className="list-none p-0 m-0 space-y-1">
            {c.results.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href!}
                  className="tui-item flex items-baseline gap-3"
                  onClick={() => c.setResults(null)}
                >
                  <span className="marker" aria-hidden="true">▸</span>
                  <span className="marker-hover" aria-hidden="true">▹</span>
                  <span className="tui-label" style={{ color: "var(--soft)" }}>
                    {p.title.toLowerCase()}
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--faint)" }}>
                    {p.date}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 text-[11px]" style={{ color: "var(--soft)" }}>
            esc to close
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- status bar */

/** the bottom line: mode · hints · ruler. no input, no output — both live
 *  at the prompt now. */
export function StatusBar({ sections }: { sections: number }) {
  const c = useCommand();
  const inCommand = c.focused || c.mode === "pw";

  return (
    <footer
      className="relative flex items-center justify-between gap-4 px-3 py-1 text-[11px] lowercase"
      style={{ borderTop: "1px solid var(--line)", color: "var(--soft)" }}
    >
      <span className="flex items-baseline gap-2 min-w-0 flex-1">
        <span
          className="px-1.5 shrink-0"
          style={{
            background: inCommand ? "var(--accent)" : "var(--green)",
            color: "var(--bg)",
          }}
        >
          {c.mode === "pw" ? "login" : inCommand ? "command" : "normal"}
        </span>
        {c.teaUntil !== null && (
          <span className="shrink-0" style={{ color: "var(--green)" }}>
            tea {Math.floor((c.teaUntil - Date.now()) / 60000)}:
            {String(Math.max(0, Math.ceil(((c.teaUntil - Date.now()) % 60000) / 1000)) % 60).padStart(2, "0")}
          </span>
        )}
        <span className="hidden sm:inline truncate" style={{ color: "var(--soft)" }}>
          j/k move · enter open · : cmd · / grep · tab complete
        </span>
      </span>
      <span className="shrink-0 text-right flex items-center gap-2" style={{ color: "var(--soft)" }}>
        <span>
          {sections} sections · © 2026 · utf-8 ·{" "}
          <span className="inline-block min-w-[3ch] text-left">{c.ruler}</span>
        </span>
        <Kaomoji slot="statusbar" className="text-[11px]" />
      </span>
    </footer>
  );
}
