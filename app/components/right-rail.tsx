const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

export interface TocItem {
  label: string;
  href: string;
}

export function RightRail({ toc }: { toc: TocItem[] }) {
  return (
    <aside className="hidden xl:flex flex-col sticky top-11 h-[calc(100vh-2.75rem)] w-[240px] shrink-0 px-6 py-16">
      <div
        className="text-[10px] uppercase tracking-wider mb-3"
        style={{ color: "var(--muted)", fontFamily: mono, letterSpacing: "0.1em" }}
      >
        On this page
      </div>
      <nav
        className="flex flex-col gap-1.5 text-[12px]"
        style={{ borderLeft: "1px solid var(--border)" }}
      >
        {toc.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="site-link pl-3 -ml-px"
            style={{ textDecoration: "none" }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
