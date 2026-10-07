import Link from "next/link";
import { DocsShell } from "../components/docs-shell";
import { Kaomoji } from "../components/kaomoji";

import { posts } from "../lib/posts";

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

      {/* a table, k9s-style: uppercase column heads, one row per post, the
          row lights up in reverse video when it can be opened */}
      <div id="posts" className="flex flex-col text-[13px]">
        <div
          className="grid grid-cols-[11ch_minmax(0,1fr)] gap-x-4 px-[1ch] pb-1 text-[11px] uppercase tracking-[0.08em]"
          style={{ color: "var(--faint)", borderBottom: "1px solid var(--line)" }}
          aria-hidden="true"
        >
          <span>date</span>
          <span className="flex justify-between">
            <span>title</span>
            <span className="hidden sm:inline">tags</span>
          </span>
        </div>
        {posts.map((post) => {
          const interactive = Boolean(post.href);
          const commonProps = {
            className: "list-row block py-3",
            style: {
              cursor: interactive ? "pointer" : "default",
            } as const,
          };
          const inner = (
            <>
              <div className="list-head grid grid-cols-[11ch_minmax(0,1fr)] gap-x-4 px-[1ch]">
                <span style={{ color: "var(--soft)" }}>{post.date}</span>
                <span className="flex items-baseline justify-between gap-4 min-w-0">
                  <h2 className="m-0 text-[13px] font-normal truncate" style={{ color: "var(--ink)" }}>
                    {post.title}
                  </h2>
                  <span className="hidden sm:inline shrink-0 text-[11px]" style={{ color: "var(--accent)" }}>
                    {post.tags.join(" ")}
                    {!interactive && " · soon"}
                  </span>
                </span>
              </div>
              <p
                className="mt-1 mb-0 pl-[1ch] sm:pl-[calc(11ch+1rem+1ch)] pr-[1ch] text-[12px] leading-[1.75]"
                style={{ color: "var(--soft)" }}
              >
                {post.description}
              </p>
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
        <div
          className="pt-2 px-[1ch] text-[11px]"
          style={{ color: "var(--faint)", borderTop: "1px solid var(--line)" }}
        >
          {posts.length} posts
        </div>
      </div>
    </DocsShell>
  );
}
