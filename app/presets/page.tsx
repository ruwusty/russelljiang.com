import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";
import { PresetsGrid } from "./presets-grid";

export const metadata: Metadata = {
  title: "Amp Presets — Russell Jiang",
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
    <DocsShell crumb="Presets" toc={toc}>
      <h1
        className="text-2xl font-semibold tracking-tight mb-1"
        style={{ color: "var(--text)" }}
      >
        Amp Presets
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
        tele 3-pos single coil — jpop / jrock
      </p>
      <PresetsGrid />
    </DocsShell>
  );
}
