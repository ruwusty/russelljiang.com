import { DocsShell } from "./components/docs-shell";

const bio =
  "first-year data science student at UNSW Sydney, working somewhere in the overlap of statistics, computing, and decision-making. i tutor students across STEM and beyond, turning exam panic into working method. away from the screen i'm a clarinettist and saxophonist, and a guitarist on a good day.";

const toc = [
  { label: "Introduction", href: "#introduction" },
  { label: "Background", href: "#background" },
  { label: "Interests", href: "#interests" },
];

const interests = [
  "causal inference, and models that can explain themselves",
  "how good typography quietly does half the work",
  "small, sharp CLI tools and whatever's in people's dotfiles",
  "chamber music — where no one's hiding in the back row",
  "notebooks, note-taking systems, and the graphs that form between ideas",
];

export default function Home() {
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

      <p className="text-[14px] leading-[1.9]" style={{ color: "var(--soft)" }}>
        {bio}
      </p>

      <aside
        className="mt-8 pl-4 text-[12px] leading-[1.9] lowercase"
        style={{ borderLeft: "1px solid var(--line)", color: "var(--soft)" }}
      >
        <span style={{ color: "var(--green)" }}>note</span> — this site is a work
        in progress. check back occasionally — or don&apos;t.{" "}
        <span style={{ color: "var(--faint)" }} aria-hidden="true">
          (￣ー￣)ゞ
        </span>
      </aside>

      <h2
        id="background"
        className="mt-16 text-[13px] lowercase tracking-[0.15em]"
        style={{ color: "var(--ink)" }}
      >
        <span style={{ color: "var(--faint)" }}>01</span> background
      </h2>
      <dl
        className="mt-4 text-[14px] grid grid-cols-[140px_1fr] gap-y-1"
        style={{ color: "var(--soft)" }}
      >
        <dt className="text-[12px]" style={{ color: "var(--faint)" }}>
          university
        </dt>
        <dd>UNSW Sydney</dd>
        <dt className="text-[12px]" style={{ color: "var(--faint)" }}>
          degree
        </dt>
        <dd>B. Data Science &amp; Decisions</dd>
        <dt className="text-[12px]" style={{ color: "var(--faint)" }}>
          year
        </dt>
        <dd>1st year</dd>
        <dt className="text-[12px]" style={{ color: "var(--faint)" }}>
          city
        </dt>
        <dd>Sydney, AU</dd>
      </dl>

      <h2
        id="interests"
        className="mt-16 text-[13px] lowercase tracking-[0.15em]"
        style={{ color: "var(--ink)" }}
      >
        <span style={{ color: "var(--faint)" }}>02</span> interests
      </h2>
      <ul className="mt-4 text-[14px] space-y-1 list-none p-0" style={{ color: "var(--soft)" }}>
        {interests.map((line) => (
          <li key={line} className="flex items-baseline gap-3">
            <span style={{ color: "var(--faint)" }}>▸</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

    </DocsShell>
  );
}
