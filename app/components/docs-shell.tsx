import Link from "next/link";
import { CatCameo } from "./cat-cameo";
import { CommandBar } from "./command-bar";
import { Kaomoji } from "./kaomoji";
import { PetalDrift } from "./petal-drift";
import { RmTheater } from "./rm-theater";
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
        <span className="jp-tip">the beauty of negative space</span>
      </span>

      <div className="mx-auto w-full max-w-[660px] flex-1 flex flex-col px-4 py-12 lg:py-20">
        {/* terminal pane */}
        <div
          className="relative flex-1 flex flex-col"
          style={{ border: "1px solid var(--line)" }}
        >
          {/* title sitting on the frame border */}
          <span
            className="absolute flex items-baseline gap-2 leading-none"
            style={{
              top: "-0.55em",
              left: "20px",
              background: "var(--bg)",
              padding: "0 10px",
              whiteSpace: "nowrap",
            }}
          >
            <Link
              href="/"
              className="display text-[15px] leading-none"
              style={{ color: "var(--ink)", textDecoration: "none" }}
            >
              russell jiang
            </Link>
            <Kaomoji
              slot="title"
              fallback="(´。• ᵕ •。`)"
              className="text-[11px]"
              style={{ letterSpacing: "normal" }}
            />
          </span>
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
          <CommandBar sections={toc.length} />

          <CatCameo />
          <PetalDrift />
          <RmTheater />
        </div>
      </div>
    </div>
  );
}
