import { DocsShell } from "./components/docs-shell";
import { Kaomoji } from "./components/kaomoji";

const bio =
  "first-year data science student at UNSW Sydney, working somewhere in the overlap of statistics, computing, and decision-making. i tutor students across STEM and beyond, turning exam panic into working method. away from the screen i'm a clarinettist and saxophonist, and a guitarist on a good day.";

const toc = [
  { label: "Introduction", href: "#introduction" },
  { label: "Background", href: "#background" },
  { label: "Interests", href: "#interests" },
];

const interests = [
  "causal inference, and models that can explain themselves",
  "game theory, and the equilibria people actually play",
  "teaching as debugging: finding the exact line where understanding diverges",
  "how good typography quietly does half the work",
  "small, sharp CLI tools and whatever's in people's dotfiles",
  "interfaces that load instantly and never animate without a reason",
  "keyboards with the right amount of click",
  "chamber music — where no one's hiding in the back row",
  "transcribing things by ear that have perfectly good sheet music",
  "notebooks, note-taking systems, and the graphs that form between ideas",
  "training like this site is designed: high intensity, low volume, nothing wasted",
  "a properly constructed bowl of pho",
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
        <Kaomoji slot="home-note" fallback="(￣ー￣)ゞ" className="text-[12px]" />
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
          degree
        </dt>
        <dd>B. Data Science &amp; Decisions @ UNSW · year 1 of 3</dd>
        <dt className="text-[12px]" style={{ color: "var(--faint)" }}>
          editor
        </dt>
        <dd>VS Code, with recurring nvim ambitions</dd>
        <dt className="text-[12px]" style={{ color: "var(--faint)" }}>
          instruments
        </dt>
        <dd>clarinet · tenor sax · telecaster</dd>
        <dt className="text-[12px]" style={{ color: "var(--faint)" }}>
          on repeat
        </dt>
        <dd>yorushika · jpop/jrock that survives the practice room</dd>
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
