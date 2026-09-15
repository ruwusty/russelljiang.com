import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";

export const metadata: Metadata = {
  title: "projects — russell jiang",
  description: "Things I build and maintain.",
};

const toc = [
  { label: "Sydney Scholars", href: "#sydney-scholars" },
  { label: "This site", href: "#this-site" },
  { label: "Proxima", href: "#proxima" },
];

interface Project {
  id: string;
  index: string;
  name: string;
  claim: string;
  role: string;
  stack: string;
  links: { label: string; href: string }[];
}

const projects: Project[] = [
  {
    id: "sydney-scholars",
    index: "01",
    name: "sydney scholars",
    claim:
      "a tutoring platform for sydney students, in production since january 2025, now at six-figure-plus revenue and 200 seats a term. i’m the sole engineer: the admin, tutor, student and parent portals, the pipeline that turns a trial class into a term enrolment, the email and notification machinery, and an ai tutor whose rag pipeline reads the class material and nothing it shouldn’t. it ships with its own eval harness (retrieval, generation, behaviour) and a privacy suite that fails ci before a leak fails a family.",
    role: "sole engineer. everything from the schema to the pixels, plus the ai tutor end to end (ingestion, retrieval, evals)",
    stack: "React · TypeScript · Supabase (Postgres, edge functions) · Claude",
    links: [{ label: "sydneyscholars.com", href: "https://sydneyscholars.com" }],
  },
  {
    id: "this-site",
    index: "02",
    name: "this site",
    claim:
      "my corner of the internet, which slowly turned into its own cms. the bio, the shelf, the study plan, even the kaomoji get edited live on the site; the repo just keeps the fallbacks. there’s also a vim command mode, a motion trial with a leaderboard, a guestbook, a daily digest curated from sixteen feeds, and a bonsai tree in here somewhere.",
    role: "everything, with a pair programmer",
    stack: "Next.js 15 · React 19 · Tailwind · Vercel Blob",
    links: [
      { label: "source", href: "https://github.com/ruwusty/russelljiang.com" },
      { label: "you are here", href: "/" },
    ],
  },
  {
    id: "proxima",
    index: "03",
    name: "proxima",
    claim:
      "an ai learning system living in my obsidian vault, named for the zone of proximal development by way of the nearest star still out of reach. the agent finds the edge of what i understand, teaches one reasoning step at a time, spars instead of lecturing, and logs every confusion to a longitudinal edges log, then reschedules the rematch on an expanding ladder: 3 days, then 10, then 21, then retired as durable. nineteen edges logged across three courses so far, six live this term, one recheck held; still self-graded, and the real test is a closed-book sit in november. one law holds it together: i generate first. it never does the thinking for me.",
    role: "designer, and the learner it grades",
    stack: "claude code · obsidian · plain markdown, on purpose",
    links: [{ label: "the philosophy", href: "/writing/the-same-shape-everywhere" }],
  },
];

export default function ProjectsPage() {
  return (
    <DocsShell crumb="projects" toc={toc}>
      <h1
        className="display text-[26px] leading-[1.4]"
        style={{ color: "var(--ink)" }}
      >
        projects
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        things i build and maintain. small list, on purpose.
      </p>

      <div className="hrule my-8" />

      {projects.map((project) => (
        <section key={project.id} id={project.id} className="mt-14 first:mt-0">
          <h2
            className="text-[13px] lowercase tracking-[0.15em]"
            style={{ color: "var(--ink)" }}
          >
            <span style={{ color: "var(--faint)" }}>{project.index}</span>{" "}
            {project.name}
          </h2>
          <p
            className="mt-3 text-[14px] leading-[1.9]"
            style={{ color: "var(--soft)" }}
          >
            {project.claim}
          </p>
          <dl
            className="mt-4 text-[13px] grid grid-cols-[70px_1fr] gap-y-1"
            style={{ color: "var(--soft)" }}
          >
            <dt className="text-[12px]" style={{ color: "var(--soft)" }}>
              role
            </dt>
            <dd className="lowercase">{project.role}</dd>
            <dt className="text-[12px]" style={{ color: "var(--soft)" }}>
              stack
            </dt>
            <dd>{project.stack}</dd>
            <dt className="text-[12px]" style={{ color: "var(--soft)" }}>
              links
            </dt>
            <dd className="flex items-baseline gap-3">
              {project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="site-link"
                  {...(link.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {link.label}
                  {link.href.startsWith("http") && (
                    <span className="text-[11px]" style={{ color: "var(--faint)" }}>
                      {" "}
                      ↗
                    </span>
                  )}
                </a>
              ))}
            </dd>
          </dl>
        </section>
      ))}
    </DocsShell>
  );
}
