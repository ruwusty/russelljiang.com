import { DocsShell } from "./docs-shell";

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
  colophon = "a dialogue distillate: my thoughts, drafted with claude.",
  children,
}: EssayLayoutProps) {
  return (
    <DocsShell crumb={crumb} toc={[]}>
      <h1 className="display text-[24px] leading-[1.5]" style={{ color: "var(--ink)" }}>
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-[12px] lowercase italic" style={{ color: "var(--soft)" }}>
          {subtitle}
        </p>
      )}
      <p className="mt-1 text-[11px] lowercase" style={{ color: "var(--faint)" }}>
        {date} · {byline}
      </p>

      <div className="hrule my-8" />

      <article className="essay">{children}</article>

      {colophon && (
        <p
          className="mt-14 pt-4 text-[11px] lowercase italic leading-[1.7]"
          style={{ borderTop: "1px solid var(--line)", color: "var(--faint)" }}
        >
          {colophon}
        </p>
      )}
    </DocsShell>
  );
}
