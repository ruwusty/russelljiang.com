import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";
import { VimTrial } from "./trial";

export const metadata: Metadata = {
  title: "vim trial — russell jiang",
  robots: { index: false, follow: false },
};

const toc = [
  { label: "Trial", href: "#trial" },
  { label: "Guide", href: "#guide" },
];

const motions: [string, string][] = [
  ["h j k l", "left, down, up, right — one step at a time"],
  ["w", "jump to the start of the next word"],
  ["b", "jump back to the start of the previous word"],
  ["e", "jump to the end of the current/next word"],
  ["0", "snap to the start of the line"],
  ["$", "snap to the end of the line"],
  ["gg", "teleport to the top of the buffer (press g twice)"],
  ["G", "teleport to the bottom of the buffer"],
];

export default function VimPage() {
  return (
    <DocsShell crumb="vim" toc={toc}>
      <h1
        className="display text-[26px] leading-[1.4]"
        style={{ color: "var(--ink)" }}
      >
        vim trial
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        motion practice for people with nvim ambitions. needs a keyboard.
      </p>

      <div className="hrule my-8" />

      <VimTrial />

      <h2
        id="guide"
        className="mt-16 text-[13px] lowercase tracking-[0.15em]"
        style={{ color: "var(--ink)" }}
      >
        <span style={{ color: "var(--faint)" }}>01</span> guide
      </h2>
      <dl
        className="mt-4 text-[13px] grid grid-cols-[90px_1fr] gap-y-1"
        style={{ color: "var(--soft)" }}
      >
        {motions.map(([key, desc]) => (
          <div key={key} className="contents">
            <dt style={{ color: "var(--green)" }}>{key}</dt>
            <dd className="lowercase">{desc}</dd>
          </div>
        ))}
      </dl>

      <div
        className="mt-6 pl-4 text-[12px] leading-[1.9] lowercase"
        style={{ borderLeft: "1px solid var(--line)", color: "var(--soft)" }}
      >
        how to learn: start on easy with just{" "}
        <span style={{ color: "var(--ink)" }}>h j k l</span> until it&apos;s boring.
        then add <span style={{ color: "var(--ink)" }}>w</span> and{" "}
        <span style={{ color: "var(--ink)" }}>b</span> — word hops are where the
        speed lives. <span style={{ color: "var(--ink)" }}>0</span> and{" "}
        <span style={{ color: "var(--ink)" }}>$</span> snap to line edges,{" "}
        <span style={{ color: "var(--ink)" }}>gg</span> and{" "}
        <span style={{ color: "var(--ink)" }}>G</span> teleport the whole buffer.
        the goal isn&apos;t speed at first — it&apos;s never reaching for the arrow
        keys. fewer keystrokes will make you faster than faster fingers will.
      </div>
    </DocsShell>
  );
}
