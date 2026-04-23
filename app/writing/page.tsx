import { DocsShell } from "../components/docs-shell";

const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

interface Post {
  title: string;
  description: string;
  date: string;
  tags: string[];
  published: string;
  href?: string;
}

const posts: Post[] = [
  {
    title: "Vibe Coding Won't Save You",
    description: "Why fundamentals still matter in the age of agentic AI.",
    date: "2026-04-12",
    tags: ["opinion", "ai"],
    published: "DataSoc",
  },
];

const toc = [
  { label: "All posts", href: "#posts" },
];

export default function WritingIndex() {
  return (
    <DocsShell crumb="Writing" toc={toc}>
      <h1
        className="text-[34px] leading-[1.15] tracking-tight font-semibold"
        style={{ color: "var(--text)" }}
      >
        Writing
      </h1>
      <p className="mt-3 text-[15px]" style={{ color: "var(--muted)" }}>
        Occasional essays. Mostly data-science-adjacent.
      </p>

      <div className="my-8 h-px" style={{ background: "var(--border)" }} />

      <div id="posts" className="flex flex-col">
        {posts.map((post) => {
          const interactive = Boolean(post.href);
          const commonProps = {
            className: "group block py-5 -mx-3 px-3 rounded-md transition-colors",
            style: {
              textDecoration: "none",
              borderTop: "1px solid var(--border)",
              cursor: interactive ? "pointer" : "default",
              opacity: interactive ? 1 : 0.85,
            } as const,
          };
          const inner = (
            <>
              <div className="flex items-baseline justify-between gap-4">
                <h2
                  className="text-[17px] font-semibold tracking-tight"
                  style={{ color: "var(--text)" }}
                >
                  {post.title}
                </h2>
                <span
                  className="shrink-0 text-[11px]"
                  style={{ color: "var(--muted)", fontFamily: mono }}
                >
                  {post.date}
                </span>
              </div>
              <p
                className="mt-1.5 text-[14px] leading-[1.6]"
                style={{ color: "var(--muted)" }}
              >
                {post.description}
              </p>
              <div
                className="mt-2.5 flex items-center gap-2 text-[11px]"
                style={{ color: "var(--muted)", fontFamily: mono }}
              >
                <span>{post.published}</span>
                <span style={{ color: "var(--border)" }}>/</span>
                <span className="flex items-center gap-1.5">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-[1px] rounded"
                      style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                    >
                      {t}
                    </span>
                  ))}
                </span>
                {!interactive && (
                  <>
                    <span style={{ color: "var(--border)" }}>/</span>
                    <span
                      className="px-1.5 py-[1px] rounded"
                      style={{
                        border: "1px solid var(--border)",
                        color: "var(--muted)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      soon
                    </span>
                  </>
                )}
              </div>
            </>
          );
          return interactive ? (
            <a
              key={post.title}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              {...commonProps}
            >
              {inner}
            </a>
          ) : (
            <div key={post.title} {...commonProps} aria-disabled="true">
              {inner}
            </div>
          );
        })}
        <div style={{ borderTop: "1px solid var(--border)" }} />
      </div>
    </DocsShell>
  );
}
