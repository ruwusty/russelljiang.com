import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";
import { Guestbook } from "./guestbook";

export const metadata: Metadata = {
  title: "guestbook — russell jiang",
};

const toc = [
  { label: "Sign", href: "#sign" },
  { label: "Entries", href: "#entries" },
];

export default function GuestbookPage() {
  return (
    <DocsShell crumb="guestbook" toc={toc}>
      <h1
        className="display text-[26px] leading-[1.4]"
        style={{ color: "var(--ink)" }}
      >
        guestbook
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        like the old web i wasn&apos;t alive for. leave a line.
      </p>

      <div className="hrule my-8" />

      <Guestbook />
    </DocsShell>
  );
}
