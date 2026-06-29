import type { Metadata } from "next";
import { DocsShell } from "../../components/docs-shell";
import { BoulderDraft } from "./draft";

// unpublished draft: noindex, unlisted (not in nav / sitemap / writing index),
// and the body is gated client-side so it never lands in the server html.
export const metadata: Metadata = {
  title: "draft — russell jiang",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <DocsShell crumb="writing/draft" toc={[]}>
      <BoulderDraft />
    </DocsShell>
  );
}
