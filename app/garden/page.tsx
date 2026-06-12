import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";
import { ZenGarden } from "./garden";

export const metadata: Metadata = {
  title: "garden — russell jiang",
  description: "A small bed of sand. Drag to rake.",
};

const toc = [{ label: "The garden", href: "#garden" }];

export default function GardenPage() {
  return (
    <DocsShell crumb="garden" toc={toc}>
      <h1
        id="garden"
        className="display text-[26px] leading-[1.4]"
        style={{ color: "var(--ink)" }}
      >
        garden
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        rake. think. smooth. repeat.
      </p>

      <div className="hrule my-8" />

      <ZenGarden />
    </DocsShell>
  );
}
