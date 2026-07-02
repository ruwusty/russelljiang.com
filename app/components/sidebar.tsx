"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  soon?: boolean;
  external?: boolean;
}

const items: NavItem[] = [
  { label: "overview", href: "/" },
  { label: "writing", href: "/writing" },
  { label: "digest", href: "/digest" },
  { label: "library", href: "/library" },
  { label: "guestbook", href: "/guestbook" },
  { label: "vim", href: "/vim" },
  { label: "bonsai", href: "/bonsai" },
  { label: "projects", href: "/projects" },
  { label: "linkedin", href: "https://linkedin.com/in/russelljiang", external: true },
  { label: "email", href: "mailto:russelljiang@pm.me", external: true },
];

const navigable = items
  .map((item, index) => ({ ...item, index }))
  .filter((item) => !item.soon);

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [selected, setSelected] = useState(-1);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "j") {
        setSelected((s) => (s + 1) % navigable.length);
      } else if (event.key === "k") {
        setSelected((s) => (s <= 0 ? navigable.length - 1 : s - 1));
      } else if (event.key === "Enter") {
        setSelected((s) => {
          const item = navigable[s];
          if (item) {
            if (item.external) {
              window.open(item.href, item.href.startsWith("mailto:") ? "_self" : "_blank");
            } else {
              router.push(item.href);
            }
          }
          return s;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <nav className="mt-10 text-[13px]" aria-label="site navigation">
      <div className="flex items-center gap-2 text-[12px]">
        <span style={{ color: "var(--green)" }}>❯</span>
        <span style={{ color: "var(--soft)" }}>ls ~/site</span>
      </div>

      <ul className="mt-3 space-y-1 list-none p-0 m-0">
        {items.map((item, i) => {
          const index = String(i + 1).padStart(2, "0");
          const active =
            !item.soon &&
            !item.external &&
            (pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/")));
          const selectedHere = navigable[selected]?.index === i;

          if (item.soon) {
            return (
              <li key={item.label} className="flex items-baseline gap-3">
                <span className="text-[11px]" style={{ color: "var(--faint)" }}>
                  {index}
                </span>
                <span style={{ color: "var(--faint)" }}>▸</span>
                <span style={{ color: "var(--faint)" }}>
                  {item.label}{" "}
                  <span className="text-[11px]">(soon)</span>
                </span>
              </li>
            );
          }

          const LinkTag = item.external ? "a" : Link;
          return (
            <li key={item.label}>
              <LinkTag
                href={item.href}
                className="tui-item flex items-baseline gap-3"
                data-selected={selectedHere ? "true" : "false"}
                {...(item.external && !item.href.startsWith("mailto:")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <span className="text-[11px]" style={{ color: "var(--faint)" }}>
                  {index}
                </span>
                <span className="marker">▸</span>
                <span className="marker-hover">▹</span>
                <span
                  className="tui-label"
                  style={{ color: active ? "var(--ink)" : "var(--soft)" }}
                >
                  {item.label}
                </span>
                {item.external && (
                  <span className="text-[11px]" style={{ color: "var(--faint)" }}>
                    ↗
                  </span>
                )}
              </LinkTag>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
