import Link from "next/link";
import { DocsShell } from "../components/docs-shell";
import { Kaomoji } from "../components/kaomoji";

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
    title: "The Same Shape Everywhere",
    description:
      "A meditation on pattern recognition, and what physics might have to say about how to live.",
    date: "2026-06-25",
    tags: ["maths", "physics"],
    published: "personal",
    href: "/writing/the-same-shape-everywhere",
  },
  {
    title: "Vibe Coding Won't Save You",
    description: "Why fundamentals still matter in the age of agentic AI.",
    date: "2026-04-12",
    tags: ["opinion", "ai"],
    published: "DataSoc",
    href: "/writing/vibe-coding-wont-save-you",
  },
];

const toc = [{ label: "All posts", href: "#posts" }];

export default function WritingIndex() {
  return (
    <DocsShell crumb="writing" toc={toc}>
      <h1
        className="display text-[26px] leading-[1.4]"
        style={{ color: "var(--ink)" }}
      >
        writing
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        occasional essays. mostly data-science-adjacent.{" "}
        <Kaomoji slot="writing" />
      </p>

      <div className="hrule my-8" />

      <div id="posts" className="flex flex-col">
        {posts.map((post) => {
          const interactive = Boolean(post.href);
          const commonProps = {
            className: "block py-5",
            style: {
              textDecoration: "none",
              borderTop: "1px solid var(--line)",
              cursor: interactive ? "pointer" : "default",
            } as const,
          };
          const inner = (
            <>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-[15px]" style={{ color: "var(--ink)" }}>
                  <span style={{ color: "var(--faint)" }}>▸</span> {post.title}
                </h2>
                <span
                  className="shrink-0 text-[11px]"
                  style={{ color: "var(--faint)" }}
                >
                  {post.date}
                </span>
              </div>
              <p
                className="mt-1 pl-5 text-[14px] leading-[1.9]"
                style={{ color: "var(--soft)" }}
              >
                {post.description}
              </p>
              <div
                className="mt-1.5 pl-5 flex items-baseline gap-2 text-[11px] lowercase"
                style={{ color: "var(--faint)" }}
              >
                <span>{post.published}</span>
                <span>·</span>
                <span className="flex items-baseline gap-1.5">
                  {post.tags.map((t) => (
                    <span key={t}>[{t}]</span>
                  ))}
                </span>
                {!interactive && (
                  <>
                    <span>·</span>
                    <span>(soon)</span>
                  </>
                )}
              </div>
            </>
          );
          const isInternal = post.href?.startsWith("/");
          return interactive && post.href ? (
            isInternal ? (
              <Link key={post.title} href={post.href} {...commonProps}>
                {inner}
              </Link>
            ) : (
              <a
                key={post.title}
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                {...commonProps}
              >
                {inner}
              </a>
            )
          ) : (
            <div key={post.title} {...commonProps} aria-disabled="true">
              {inner}
            </div>
          );
        })}
        <div style={{ borderTop: "1px solid var(--line)" }} />
      </div>
    </DocsShell>
  );
}
