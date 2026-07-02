import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";
import { Stats } from "./stats";

export const metadata: Metadata = {
  title: "stats — russell jiang",
  description: "The site, about itself.",
  robots: { index: false, follow: false },
};

const toc = [{ label: "Numbers", href: "#numbers" }];

export default function StatsPage() {
  return (
    <DocsShell crumb="stats" toc={toc}>
      <h1
        className="display text-[26px] leading-[1.4]"
        style={{ color: "var(--ink)" }}
      >
        stats
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        the site, about itself.
      </p>

      <div className="hrule my-8" />

      <Stats />
    </DocsShell>
  );
}
