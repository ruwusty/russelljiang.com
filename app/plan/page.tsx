import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";
import { ProgramPlanner } from "./planner";

export const metadata: Metadata = {
  title: "program planner — russell jiang",
  robots: { index: false, follow: false },
};

const toc = [
  { label: "Year 1", href: "#year-1" },
  { label: "Year 2", href: "#year-2" },
  { label: "Year 3", href: "#year-3" },
];

export default function PlanPage() {
  return (
    <DocsShell crumb="plan" toc={toc}>
      <h1
        className="display text-[26px] leading-[1.4]"
        style={{ color: "var(--ink)" }}
      >
        program planner
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        bachelor of data science and decisions — 3959 compz1
      </p>

      <div className="hrule my-8" />

      <ProgramPlanner />
    </DocsShell>
  );
}
