import { Sidebar } from "./sidebar";
import { RightRail, type TocItem } from "./right-rail";
import { StatusStrip } from "./status-strip";
import { ThemeToggle } from "./theme-toggle";

const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

interface DocsShellProps {
  crumb: string;
  toc: TocItem[];
  children: React.ReactNode;
}

export function DocsShell({ crumb, toc, children }: DocsShellProps) {
  return (
    <>
      <div className="relative z-10 min-h-screen flex flex-col">
        <StatusStrip />

        <div className="flex-1 flex">
          <Sidebar />

          <main
            className="flex-1 min-w-0 px-6 lg:px-14 py-12 lg:py-16"
            style={{ background: "color-mix(in srgb, var(--bg) 78%, transparent)" }}
          >
            <div className="lg:hidden flex items-center justify-between mb-8">
              <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                russell.jiang
              </span>
              <ThemeToggle />
            </div>

            <div className="max-w-[680px]">
              <div
                className="text-[11px] mb-4 flex items-center gap-2"
                style={{ color: "var(--muted)", fontFamily: mono }}
              >
                <span>Personal</span>
                <span style={{ color: "var(--border)" }}>/</span>
                <span style={{ color: "var(--text)" }}>{crumb}</span>
              </div>

              {children}

              <div
                className="mt-20 pt-6 flex items-center justify-between text-[11px]"
                style={{
                  borderTop: "1px solid var(--border)",
                  color: "var(--muted)",
                  fontFamily: mono,
                }}
              >
                <span>© 2026 Russell Jiang</span>
                <span>built with Next.js</span>
              </div>
            </div>
          </main>

          <RightRail toc={toc} />
        </div>
      </div>
    </>
  );
}
