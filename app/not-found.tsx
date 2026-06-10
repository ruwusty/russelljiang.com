import type { Metadata } from "next";
import { DocsShell } from "./components/docs-shell";
import { LostCat } from "./components/lost-cat";

export const metadata: Metadata = {
  title: "404 — russell jiang",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <DocsShell crumb="404" toc={[]}>
      <h1
        className="display text-[26px] leading-[1.4]"
        style={{ color: "var(--ink)" }}
      >
        page not found
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        E404: no such file or directory
      </p>

      <div className="hrule my-8" />

      <div className="flex items-baseline gap-2 text-[12px]" style={{ color: "var(--soft)" }}>
        <span style={{ color: "var(--green)" }}>❯</span>
        <span>cat ./this-page</span>
      </div>
      <p className="mt-2 text-[13px] leading-[1.9] lowercase" style={{ color: "var(--soft)" }}>
        cat: ./this-page: no such file or directory.
        <br />
        we did, however, find an actual cat. it&apos;s also lost.
      </p>

      <LostCat />

      <p className="mt-4 text-[11px] lowercase" style={{ color: "var(--faint)" }}>
        j/k to navigate, enter to open · or :go home
      </p>
    </DocsShell>
  );
}
