"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  soon?: boolean;
  external?: boolean;
  /** first row of a group: pages, then toys, then elsewhere */
  group?: boolean;
}

const items: NavItem[] = [
  { label: "overview", href: "/" },
  { label: "writing", href: "/writing" },
  { label: "digest", href: "/digest" },
  { label: "library", href: "/library" },
  { label: "projects", href: "/projects" },
  { label: "guestbook", href: "/guestbook", group: true },
  { label: "vim", href: "/vim" },
  { label: "bonsai", href: "/bonsai" },
  { label: "games", href: "/games" },
  { label: "linkedin", href: "https://linkedin.com/in/russelljiang", external: true, group: true },
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
  const listRef = useRef<HTMLUListElement>(null);

  // on a phone the nav is one scrolling row: bring the current page into it.
  // scrollLeft, not scrollIntoView, so the page itself never jumps.
  useEffect(() => {
    const list = listRef.current;
    const current = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (list && current) {
      list.scrollLeft = current.offsetLeft - (list.clientWidth - current.clientWidth) / 2;
    }
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "j") {
        setSelected((s) => (s + 1) % navigable.length);
      } else if (event.key === "k") {
        setSelected((s) => (s <= 0 ? navigable.length - 1 : s - 1));
      } else if (event.key === "Enter") {
        // if real dom focus is on a link/button, let the browser handle it —
        // otherwise tab-focus + enter would navigate to the hidden j/k
        // selection instead of the focused element
        if (event.target instanceof HTMLElement && event.target.closest("a, button")) {
          return;
        }
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
    <nav className="text-[13px]" aria-label="site navigation">
      {/* a list widget on desktop; on a phone it is one row that scrolls
          sideways, so the page itself is above the fold */}
      <ul
        ref={listRef}
        className="relative mt-1 list-none m-0 -mx-2 px-2 py-1 flex gap-x-4 overflow-x-auto whitespace-nowrap lg:mx-0 lg:p-0 lg:block lg:space-y-0.5 lg:overflow-visible lg:whitespace-normal"
        style={{ scrollbarWidth: "none" }}
      >
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
            <li key={item.label} className={item.group ? "lg:!mt-3" : undefined}>
              <LinkTag
                href={item.href}
                className="tui-item nav-row flex items-baseline gap-3 py-1 lg:py-0"
                data-selected={selectedHere ? "true" : "false"}
                aria-current={active ? "page" : undefined}
                {...(item.external && !item.href.startsWith("mailto:")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {/* links out keep the column but not a page number */}
                <span
                  className={`hidden lg:inline text-[11px] ${item.external ? "invisible" : ""}`}
                  style={{ color: "var(--faint)" }}
                  aria-hidden="true"
                >
                  {index}
                </span>
                <span className="marker hidden lg:inline" aria-hidden="true">▸</span>
                <span className="marker-hover" aria-hidden="true">▹</span>
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
