import Link from "next/link";
import { CatCameo } from "./cat-cameo";
import { CommandProvider, Prompt, StatusBar } from "./command-bar";
import { Kaomoji } from "./kaomoji";
import { MoonPhase } from "./moon-phase";
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

// the deployed commit, shown in the status bar like a shell prompt's git
// segment. vercel sets this at build; locally it is simply absent.
const COMMIT = (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7) || "dev";

export function DocsShell({ crumb, toc, children }: DocsShellProps) {
  // a one-entry outline is a label, not a map; give main the room instead
  const outline = toc.length > 1;

  return (
    <CommandProvider>
    <div className="relative min-h-screen flex flex-col">
      <a href="#content" className="skip-link">
        skip to content
      </a>
      <span className="vertical-jp" aria-hidden="true">
        余白の美
        <span className="jp-tip">the beauty of negative space</span>
      </span>

      <div className="mx-auto w-full max-w-[1240px] flex-1 flex flex-col px-3 py-4 sm:px-6 sm:py-8 lg:py-12">
        <div className="window flex-1 flex flex-col">
          {/* title bar: who, and the two switches */}
          <div className="titlebar flex items-center justify-between gap-4 px-4 sm:px-5 h-11">
            <span className="flex items-baseline gap-2 min-w-0 leading-none">
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
                className="hidden sm:inline text-[11px]"
                style={{ letterSpacing: "normal" }}
              />
            </span>
            <span className="leading-none flex items-center gap-3 shrink-0">
              <MoonPhase />
              <ThemeToggle />
            </span>
          </div>

          {/* the tiles. below lg the side panes fold above and below main, and
              only main grows: without the explicit rows a short page stretches
              every row, and the nav pane grows a blank tail on tablets */}
          <div className={`flex-1 grid grid-rows-[auto_1fr_auto] gap-3 p-3 sm:gap-4 sm:p-4 lg:grid-rows-none lg:grid-cols-[210px_minmax(0,1fr)] ${outline ? "xl:grid-cols-[210px_minmax(0,1fr)_180px]" : ""}`}>
            <div className="contents lg:flex lg:flex-col lg:gap-4">
              <fieldset className="pane intro-boot px-4 pb-3 pt-1 lg:px-5 lg:pb-4">
                <legend>
                  <span className="key">[1]</span> ~/site
                </legend>
                <Sidebar />
              </fieldset>
              <fieldset className="pane intro-boot px-4 pb-3 pt-1 order-last lg:order-none lg:px-5 lg:pb-4">
                <legend>
                  <span className="key">[2]</span> status
                </legend>
                <StatusStrip />
              </fieldset>
            </div>

            <fieldset className="pane relative min-h-[60vh] px-5 pb-10 pt-2 sm:px-8 lg:px-10">
              <legend>
                <span className="key">[3]</span> ~/personal/{crumb}
              </legend>
              {/* the command line, where the eye lands */}
              <Prompt />
              <main id="content" className="mt-10 max-w-[720px]">
                {children}
              </main>
              <CatCameo />
              <PetalDrift />
              <RmTheater />
            </fieldset>

            {outline && (
              <div className="hidden xl:block">
                <fieldset className="pane intro-boot sticky top-6 px-4 pb-3 pt-1">
                  <legend>
                    <span className="key">[4]</span> outline
                  </legend>
                  <ol className="list-none m-0 p-0 text-[12px] space-y-0.5">
                    {toc.map((item, i) => (
                      <li key={item.href}>
                        <a href={item.href} className="site-link flex items-baseline gap-2 lowercase">
                          <span style={{ color: "var(--faint)" }} aria-hidden="true">
                            {i === toc.length - 1 ? "└─" : "├─"}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </fieldset>
              </div>
            )}
          </div>

          <StatusBar crumb={crumb} commit={COMMIT} />
        </div>
      </div>
    </div>
    </CommandProvider>
  );
}
