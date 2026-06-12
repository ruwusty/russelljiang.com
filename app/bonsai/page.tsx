import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";
import { Bonsai } from "./bonsai";

export const metadata: Metadata = {
  title: "bonsai — russell jiang",
  description: "A tree that grows at the speed of patience.",
};

const toc = [{ label: "The tree", href: "#tree" }];

export default function BonsaiPage() {
  return (
    <DocsShell crumb="bonsai" toc={toc}>
      <h1
        id="tree"
        className="display text-[26px] leading-[1.4]"
        style={{ color: "var(--ink)" }}
      >
        bonsai
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        a tree that grows at the speed of patience.
      </p>

      <div className="hrule my-8" />

      <Bonsai />
    </DocsShell>
  );
}
