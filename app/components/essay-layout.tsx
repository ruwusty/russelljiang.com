import { readFileSync } from "fs";
import { join } from "path";
import { slugify } from "../lib/slug";
import { DocsShell, type TocItem } from "./docs-shell";

// the outline comes from the essay's own `## headings`, read at build time
// (essay pages are static), so nobody has to keep a toc in sync by hand.
function outlineFor(crumb: string): TocItem[] {
  try {
    const src = readFileSync(join(process.cwd(), "app", crumb, "content.mdx"), "utf8");
    return [...src.matchAll(/^## (.+)$/gm)].map((m) => {
      const label = m[1].trim();
      return { label, href: `#${slugify(label)}` };
    });
  } catch {
    return [];
  }
}

interface EssayLayoutProps {
  title: string;
  subtitle?: string;
  date: string; // YYYY-MM-DD
  byline?: string; // defaults to "russell jiang"
  crumb: string; // e.g. "writing/my-essay"
  colophon?: string | null; // null hides it; default credits the drafting
  children: React.ReactNode;
}

// shared shell for mdx essays — see docs/WRITING.md for how to add one.
export function EssayLayout({
  title,
  subtitle,
  date,
  byline = "russell jiang",
  crumb,
  colophon = "a dialogue distillate: my thoughts, drafted with fable.",
  children,
}: EssayLayoutProps) {
  return (
    <DocsShell crumb={crumb} toc={outlineFor(crumb)}>
      <h1 className="display text-[24px] leading-[1.5]" style={{ color: "var(--ink)" }}>
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-[12px] lowercase italic" style={{ color: "var(--soft)" }}>
          {subtitle}
        </p>
      )}
      <p className="mt-1 text-[11px] lowercase" style={{ color: "var(--soft)" }}>
        {date} · {byline}
      </p>

      <div className="hrule my-8" />

      <article className="essay">{children}</article>

      {colophon && (
        <p
          className="mt-14 pt-4 text-[11px] lowercase italic leading-[1.7]"
          style={{ borderTop: "1px solid var(--line)", color: "var(--soft)" }}
        >
          {colophon}
        </p>
      )}
    </DocsShell>
  );
}
