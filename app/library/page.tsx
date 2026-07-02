import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";
import { Library } from "./library";

export const metadata: Metadata = {
  title: "library — russell jiang",
  description: "A curated shelf: what I'm reading, what's queued, what's done.",
};

const toc = [{ label: "The shelf", href: "#shelf" }];

export default function LibraryPage() {
  return (
    <DocsShell crumb="library" toc={toc}>
      <h1
        className="display text-[26px] leading-[1.4]"
        style={{ color: "var(--ink)" }}
      >
        library
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        a curated shelf. one book leads to the next.
      </p>

      <div className="hrule my-8" />

      <Library />
    </DocsShell>
  );
}
