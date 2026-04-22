import { DocsShell } from "./components/docs-shell";

const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

const bio =
  "First-year Data Science student at UNSW Sydney, exploring the overlap between machine learning, statistics, and software that actually does something useful. I tutor students one-on-one across STEM and beyond. When I'm away from a screen, I play clarinet and sax — or slowly get better at guitar.";

const toc = [
  { label: "Introduction", href: "#introduction" },
  { label: "Background", href: "#background" },
  { label: "Interests", href: "#interests" },
  { label: "Contact", href: "#contact" },
];

const links = [
  { href: "https://github.com/ruwusty", label: "GitHub", external: true },
  { href: "https://linkedin.com/in/russelljiang", label: "LinkedIn", external: true },
  { href: "mailto:russelljiang@pm.me", label: "Email", external: false },
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
    <DocsShell crumb="Introduction" toc={toc}>
      <h1
        id="introduction"
        className="text-[34px] leading-[1.15] tracking-tight font-semibold"
        style={{ color: "var(--text)" }}
      >
        Russell Jiang
      </h1>
      <p className="mt-3 text-[15px]" style={{ color: "var(--muted)" }}>
        Data Science @ UNSW · Tutor · AmusA
      </p>

      <div className="my-8 h-px" style={{ background: "var(--border)" }} />

      <p className="text-[15px] leading-[1.75]" style={{ color: "var(--muted)" }}>
        {bio}
      </p>

      <div
        className="mt-6 px-4 py-3 rounded-md text-[13px] leading-[1.7]"
        style={{
          border: "1px solid var(--border)",
          color: "var(--muted)",
          background: "color-mix(in srgb, var(--bg) 60%, transparent)",
        }}
      >
        <span style={{ color: "var(--text)", fontFamily: mono, fontSize: "11px" }}>
          NOTE
        </span>
        <span className="mx-2" style={{ color: "var(--border)" }}>·</span>
        This site is a work in progress. Check back occasionally — or don't.
      </div>

      <h2
        id="background"
        className="mt-14 text-[20px] tracking-tight font-semibold"
        style={{ color: "var(--text)" }}
      >
        Background
      </h2>
      <dl
        className="mt-4 text-[14px] grid grid-cols-[120px_1fr] gap-y-2"
        style={{ color: "var(--muted)" }}
      >
        <dt style={{ fontFamily: mono, fontSize: "12px" }}>university</dt>
        <dd>UNSW Sydney</dd>
        <dt style={{ fontFamily: mono, fontSize: "12px" }}>degree</dt>
        <dd>B. Data Science & Decisions</dd>
        <dt style={{ fontFamily: mono, fontSize: "12px" }}>year</dt>
        <dd>1st year</dd>
        <dt style={{ fontFamily: mono, fontSize: "12px" }}>city</dt>
        <dd>Sydney, AU</dd>
      </dl>

      <h2
        id="interests"
        className="mt-14 text-[20px] tracking-tight font-semibold"
        style={{ color: "var(--text)" }}
      >
        Interests
      </h2>
      <ul
        className="mt-4 text-[14px] space-y-1.5"
        style={{ color: "var(--muted)" }}
      >
        {interests.map((line) => (
          <li key={line}>
            <span style={{ fontFamily: mono, color: "var(--text)" }}>—</span>{" "}
            {line}
          </li>
        ))}
      </ul>

      <h2
        id="contact"
        className="mt-14 text-[20px] tracking-tight font-semibold"
        style={{ color: "var(--text)" }}
      >
        Contact
      </h2>
      <div className="mt-4 flex items-center gap-1 text-[14px]">
        {links.map(({ href, label, external }, i) => (
          <span key={label} className="flex items-center">
            {i > 0 && (
              <span className="mx-2.5 select-none" style={{ color: "var(--border)" }}>
                ·
              </span>
            )}
            <a
              href={href}
              className="site-link"
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {label}
            </a>
          </span>
        ))}
      </div>
    </DocsShell>
  );
}
