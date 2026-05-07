import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";
import { ProgramPlanner } from "./planner";

export const metadata: Metadata = {
  title: "Program Planner — Russell Jiang",
  robots: { index: false, follow: false },
};

const toc = [
  { label: "Year 1", href: "#year-1" },
  { label: "Year 2", href: "#year-2" },
  { label: "Year 3", href: "#year-3" },
];

export default function PlanPage() {
  return (
    <DocsShell crumb="Plan" toc={toc}>
      <h1
        className="text-2xl font-semibold tracking-tight mb-1"
        style={{ color: "var(--text)" }}
      >
        Program Planner
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
        Bachelor of Data Science and Decisions — 3959 COMPZ1
      </p>
      <ProgramPlanner />
    </DocsShell>
  );
}
