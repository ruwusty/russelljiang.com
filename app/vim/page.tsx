import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";
import { VimTrial } from "./trial";

export const metadata: Metadata = {
  title: "vim trial — russell jiang",
  robots: { index: false, follow: false },
};

const toc = [{ label: "Trial", href: "#trial" }];

export default function VimPage() {
  return (
    <DocsShell crumb="vim" toc={toc}>
      <h1
        className="display text-[26px] leading-[1.4]"
        style={{ color: "var(--ink)" }}
      >
        vim trial
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        motion practice for people with nvim ambitions. needs a keyboard.
      </p>

      <div className="hrule my-8" />

      <VimTrial />
    </DocsShell>
  );
}
