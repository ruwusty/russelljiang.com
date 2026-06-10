import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";
import { CatPet } from "./cat-pet";

export const metadata: Metadata = {
  title: "the cat — russell jiang",
  robots: { index: false, follow: false },
};

const toc = [{ label: "The cat", href: "#cat" }];

export default function CatPage() {
  return (
    <DocsShell crumb="404/cat" toc={toc}>
      <h1
        id="cat"
        className="display text-[26px] leading-[1.4]"
        style={{ color: "var(--ink)" }}
      >
        the cat
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        found on a missing page. lives here now.
      </p>

      <div className="hrule my-8" />

      <CatPet />
    </DocsShell>
  );
}
