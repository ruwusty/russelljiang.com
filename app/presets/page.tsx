import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";
import { PresetsGrid } from "./presets-grid";

export const metadata: Metadata = {
  title: "amp presets — russell jiang",
  robots: { index: false, follow: false },
};

const toc = [
  { label: "Clean", href: "#preset-1" },
  { label: "Clean Chorus", href: "#preset-2" },
  { label: "Kita Rhythm", href: "#preset-3" },
  { label: "Yorushika Lead", href: "#preset-4" },
  { label: "Ambient", href: "#preset-5" },
  { label: "Bocchi Lead", href: "#preset-6" },
  { label: "Light Drive", href: "#preset-7" },
];

export default function PresetsPage() {
  return (
    <DocsShell crumb="presets" toc={toc}>
      <h1
        className="display text-[26px] leading-[1.4]"
        style={{ color: "var(--ink)" }}
      >
        amp presets
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        tele 3-pos single coil — jpop / jrock
      </p>

      <div className="hrule my-8" />

      <PresetsGrid />
    </DocsShell>
  );
}
