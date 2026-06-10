import { DocsShell } from "./components/docs-shell";
import { HomeEditor } from "./components/home-editor";
import { readHomeContent } from "./lib/home-store";

export const dynamic = "force-dynamic";

const toc = [
  { label: "Introduction", href: "#introduction" },
  { label: "Background", href: "#background" },
  { label: "Interests", href: "#interests" },
];

export default async function Home() {
  const content = await readHomeContent();

  return (
    <DocsShell crumb="introduction" toc={toc}>
      <h1
        id="introduction"
        className="display text-[26px] leading-[1.4]"
        style={{ color: "var(--ink)" }}
      >
        russell jiang
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        data science @ unsw · tutor · amusa
      </p>

      <div className="hrule my-8" />

      <HomeEditor initial={content} />
    </DocsShell>
  );
}
