import { ThemeToggle } from "./components/theme-toggle";

const bio =
  "First-year Data Science student at UNSW Sydney, exploring the overlap between machine learning, statistics, and software that actually does something useful. I tutor students one-on-one across STEM and beyond. When I'm away from a screen, I'm playing clarinet or saxophone — or slowly getting better at guitar.";

const links = [
  { href: "https://github.com/ruwusty", label: "GitHub", external: true },
  { href: "https://linkedin.com/in/russelljiang", label: "LinkedIn", external: true },
  { href: "mailto:russelljiang@pm.me", label: "Email", external: false },
];

export default function Home() {
  return (
    <>
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <main className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-[460px] fade-in">

          <h1
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Russell Jiang
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--muted)" }}>
            Data Science · UNSW Sydney · Tutor · AmusA
          </p>

          <div
            className="my-7 h-px"
            style={{ background: "var(--border)" }}
          />

          <p
            className="text-sm leading-[1.85]"
            style={{ color: "var(--muted)" }}
          >
            {bio}
          </p>

          <div className="mt-8 flex items-center gap-1 text-sm">
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

        </div>
      </main>
    </>
  );
}
