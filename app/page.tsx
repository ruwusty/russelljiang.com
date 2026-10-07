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
    <DocsShell crumb="overview" toc={toc}>
      {/* `.intro-content` is what `cat ~/about.md` prints. it is in the ssr
          html regardless (seo); on a first visit globals.css hides it for the
          ~0.9s the prompt takes to type, then it shows. see command-bar.tsx. */}
      {/* `.intro-content` is what `cat ~/about.md` prints. it is in the ssr
          html regardless (seo); on a first visit globals.css hides it for the
          ~0.9s the prompt takes to type, then it shows. see command-bar.tsx. */}
      <div className="intro-content">
        <HomeEditor
          initial={content}
          heading={
            <>
              <h1
                className="display text-[26px] xl:text-[30px] leading-[1.3] m-0"
                style={{ color: "var(--ink)" }}
              >
                russell jiang
              </h1>
              <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
                b. data science and decisions (i) @ unsw · tutor &amp; tech @ sydney scholars · amusa
              </p>
            </>
          }
        />
      </div>
    </DocsShell>
  );
}
