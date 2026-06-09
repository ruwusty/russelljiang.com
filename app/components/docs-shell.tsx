import Link from "next/link";
import { Sidebar } from "./sidebar";
import { StatusStrip } from "./status-strip";
import { ThemeToggle } from "./theme-toggle";

export interface TocItem {
  label: string;
  href: string;
}

interface DocsShellProps {
  crumb: string;
  toc: TocItem[];
  children: React.ReactNode;
}

export function DocsShell({ crumb, toc, children }: DocsShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <span className="vertical-jp" aria-hidden="true">
        余白の美
      </span>

      <div className="mx-auto w-full max-w-[660px] flex-1 flex flex-col px-4 py-12 lg:py-20">
        {/* terminal pane */}
        <div
          className="relative flex-1 flex flex-col"
          style={{ border: "1px solid var(--line)" }}
        >
          {/* title sitting on the frame border */}
          <Link
            href="/"
            className="display absolute text-[15px] leading-none"
            style={{
              top: "-0.55em",
              left: "20px",
              background: "var(--bg)",
              padding: "0 10px",
              color: "var(--ink)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            russell jiang{" "}
            <span
              className="text-[11px]"
              style={{ color: "var(--faint)", letterSpacing: "normal" }}
              aria-hidden="true"
            >
              ( ˶ˆᗜˆ˵ )
            </span>
          </Link>
          <span
            className="absolute leading-none"
            style={{
              top: "-0.6em",
              right: "16px",
              background: "var(--bg)",
              padding: "0 8px",
            }}
          >
            <ThemeToggle />
          </span>

          <div className="flex-1 flex flex-col px-6 sm:px-10 pt-12 pb-10">
            <header>
              <div className="text-[11px] lowercase" style={{ color: "var(--soft)" }}>
                ~/personal/{crumb}
              </div>

              <Sidebar />
              <StatusStrip />
            </header>

            <main className="mt-14 flex-1">{children}</main>
          </div>

          {/* statusbar */}
          <footer
            className="flex items-center justify-between gap-4 px-3 py-1 text-[11px] lowercase"
            style={{ borderTop: "1px solid var(--line)", color: "var(--soft)" }}
          >
            <span className="flex items-baseline gap-2 truncate">
              <span
                className="px-1.5"
                style={{ background: "var(--green)", color: "var(--bg)" }}
              >
                normal
              </span>
              <span className="hidden sm:inline" style={{ color: "var(--faint)" }}>
                j/k move · enter open
              </span>
            </span>
            <span className="shrink-0 text-right" style={{ color: "var(--faint)" }}>
              {toc.length} sections · © 2026 · utf-8
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
