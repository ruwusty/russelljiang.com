import type { MDXComponents } from "mdx/types";
import { slugify } from "./app/lib/slug";

// house-style prose for .mdx essays. headings are auto-numbered via the css
// counter on `.essay` (see globals.css), so essays just write `## heading`.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // the id is what the outline pane links to (essay-layout.tsx builds the
    // same slug from the same heading text)
    h2: (props) => (
      <h2
        id={typeof props.children === "string" ? slugify(props.children) : undefined}
        className="essay-h2 mt-14 scroll-mt-6 text-[17px] lowercase tracking-[0.04em]"
        style={{ color: "var(--ink)" }}
        {...props}
      />
    ),
    p: (props) => (
      <p className="mt-5 text-[14px] leading-[1.9]" style={{ color: "var(--ink)" }} {...props} />
    ),
    // body is ink, so the leaned-on line takes the accent (no bold weights)
    strong: (props) => <span style={{ color: "var(--accent)" }} {...props} />,
    em: (props) => <em className="italic" {...props} />,
    blockquote: (props) => (
      <blockquote
        className="mt-6 pl-4 text-[13px] leading-[1.9]"
        style={{ borderLeft: "1px solid var(--line)", color: "var(--soft)" }}
        {...props}
      />
    ),
    a: (props) => (
      <a
        className="site-link"
        style={{ textDecoration: "underline" }}
        target={props.href?.startsWith("http") ? "_blank" : undefined}
        rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
        {...props}
      />
    ),
    hr: () => <div className="hrule my-10" />,
    ul: (props) => (
      <ul className="mt-5 flex flex-col gap-1 list-none p-0" {...props} />
    ),
    li: (props) => (
      <li className="flex items-baseline gap-3 text-[14px] leading-[1.9]" style={{ color: "var(--ink)" }}>
        <span style={{ color: "var(--faint)" }}>▸</span>
        <span>{props.children}</span>
      </li>
    ),
    code: (props) => (
      <code className="text-[13px]" style={{ color: "var(--ink)" }} {...props} />
    ),
    ...components,
  };
}
