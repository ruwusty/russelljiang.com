import { DocsShell } from "../components/docs-shell";

const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

const toc = [
  { label: "Hardware", href: "#hardware" },
  { label: "Dev", href: "#dev" },
  { label: "Music", href: "#music" },
  { label: "Web", href: "#web" },
  { label: "This site", href: "#this-site" },
];

type Section = {
  id: string;
  title: string;
  rows: [string, string][];
};

const sections: Section[] = [
  {
    id: "hardware",
    title: "Hardware",
    rows: [
      ["laptop", "Lenovo Legion 5 Pro"],
      ["phone", "iPhone 16"],
      ["keyboard", "Tide65"],
      ["earbuds", "AirPods (1st gen)"],
      ["iems", "Kiwi Ears Cadenza"],
    ],
  },
  {
    id: "dev",
    title: "Dev",
    rows: [
      ["editor", "VS Code (trying to learn nvim)"],
      ["pair", "Claude Code"],
      ["terminal", "Windows Terminal"],
      ["shell", "Bash (via Git Bash)"],
      ["notes", "Obsidian"],
      ["languages", "Python, TypeScript, R"],
      ["version control", "Git + GitHub"],
    ],
  },
  {
    id: "music",
    title: "Music",
    rows: [
      ["clarinet", "Bb, Buffet R13"],
      ["saxophone", "tenor"],
      ["guitar", "Telecaster"],
      ["reeds", "Vandoren, 3–3.5"],
    ],
  },
  {
    id: "web",
    title: "Web",
    rows: [
      ["browser", "Zen"],
      ["music", "Spotify"],
      ["chat", "Discord"],
      ["search", "DuckDuckGo"],
    ],
  },
  {
    id: "this-site",
    title: "This site",
    rows: [
      ["framework", "Next.js 15 · React 19"],
      ["styling", "Tailwind"],
      ["font", "Inter"],
      ["host", "Vercel"],
      ["graph", "custom canvas, force-directed"],
    ],
  },
];

export default function UsesPage() {
  return (
    <DocsShell crumb="Uses" toc={toc}>
      <h1
        className="text-[34px] leading-[1.15] tracking-tight font-semibold"
        style={{ color: "var(--text)" }}
      >
        Uses
      </h1>
      <p className="mt-3 text-[15px]" style={{ color: "var(--muted)" }}>
        Kit, software, and miscellany I actually touch day-to-day.
      </p>

      <div className="my-8 h-px" style={{ background: "var(--border)" }} />

      <p className="text-[14px] leading-[1.75]" style={{ color: "var(--muted)" }}>
        Inspired by{" "}
        <a
          href="https://uses.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="site-link"
        >
          uses.tech
        </a>
        . Updated whenever something changes enough to notice.
      </p>

      {sections.map((section) => (
        <section key={section.id}>
          <h2
            id={section.id}
            className="mt-14 text-[20px] tracking-tight font-semibold"
            style={{ color: "var(--text)" }}
          >
            {section.title}
          </h2>
          <dl
            className="mt-4 text-[14px] grid grid-cols-[140px_1fr] gap-y-2"
            style={{ color: "var(--muted)" }}
          >
            {section.rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt style={{ fontFamily: mono, fontSize: "12px" }}>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </DocsShell>
  );
}
