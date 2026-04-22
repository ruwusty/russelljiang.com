"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

const pages = [
  { label: "Overview", href: "/" },
  { label: "Uses", href: "/uses" },
  { label: "Writing", href: "/writing" },
  { label: "Projects", href: "/projects", soon: true },
];

const external = [
  { label: "GitHub", href: "https://github.com/ruwusty" },
  { label: "LinkedIn", href: "https://linkedin.com/in/russelljiang" },
  { label: "Email", href: "mailto:russelljiang@pm.me" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col sticky top-11 h-[calc(100vh-2.75rem)] w-[240px] shrink-0 px-6 py-10 border-r"
      style={{
        borderColor: "var(--border)",
        background: "color-mix(in srgb, var(--bg) 85%, transparent)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--text)" }}>
          russell.jiang
        </span>
        <span
          className="text-[10px] px-1.5 py-[1px] rounded"
          style={{
            color: "var(--muted)",
            border: "1px solid var(--border)",
            fontFamily: mono,
          }}
        >
          v1.0
        </span>
      </div>

      <button
        type="button"
        className="mt-5 flex items-center justify-between text-left text-[12px] px-2.5 py-1.5 rounded-md"
        style={{
          border: "1px solid var(--border)",
          color: "var(--muted)",
          background: "transparent",
          fontFamily: mono,
        }}
        aria-label="Search"
      >
        <span>Search…</span>
        <span className="text-[10px] px-1 rounded" style={{ border: "1px solid var(--border)" }}>
          ⌘K
        </span>
      </button>

      <nav className="mt-7 flex flex-col gap-0.5 text-[13px]">
        <div
          className="text-[10px] uppercase tracking-wider mb-2 px-2"
          style={{ color: "var(--muted)", fontFamily: mono, letterSpacing: "0.1em" }}
        >
          Pages
        </div>
        {pages.map((item) => {
          const active =
            !item.soon &&
            (pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/")));
          return (
            <a
              key={item.label}
              href={item.soon ? undefined : item.href}
              className="flex items-center justify-between px-2 py-1 rounded"
              style={{
                textDecoration: "none",
                color: active ? "var(--text)" : "var(--muted)",
                background: active
                  ? "color-mix(in srgb, var(--muted) 12%, transparent)"
                  : "transparent",
                fontWeight: active ? 500 : 400,
                opacity: item.soon ? 0.55 : 1,
                pointerEvents: item.soon ? "none" : "auto",
              }}
            >
              <span>{item.label}</span>
              {item.soon && (
                <span
                  className="text-[9px] px-1 py-[1px] rounded"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--muted)",
                    fontFamily: mono,
                    letterSpacing: "0.05em",
                  }}
                >
                  soon
                </span>
              )}
            </a>
          );
        })}

        <div
          className="text-[10px] uppercase tracking-wider mb-2 mt-5 px-2"
          style={{ color: "var(--muted)", fontFamily: mono, letterSpacing: "0.1em" }}
        >
          External
        </div>
        {external.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="site-link flex items-center justify-between px-2 py-1 rounded"
            style={{ textDecoration: "none" }}
          >
            <span>{item.label}</span>
            <span style={{ fontFamily: mono, fontSize: "11px", color: "var(--border)" }}>↗</span>
          </a>
        ))}
      </nav>

      <div className="mt-auto pt-6 flex items-center justify-between">
        <span className="text-[10px]" style={{ color: "var(--muted)", fontFamily: mono }}>
          updated 2026-04-22
        </span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
