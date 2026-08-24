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
      "a tutoring platform for sydney students. i build the machinery behind it: the admin, tutor, and student portals, the pipeline that turns a trial class into a term enrolment, and an ai tutor whose rag pipeline reads the class material and nothing it shouldn’t.",
    role: "tech lead. portals, the enrolment lifecycle, the ai tutor end to end (ingestion, retrieval, evals)",
    stack: "React · TypeScript · Supabase (Postgres, edge functions)",
    links: [{ label: "sydneyscholars.com", href: "https://sydneyscholars.com" }],
  },
  {
    id: "this-site",
    index: "02",
    name: "this site",
    claim:
      "my corner of the internet, which slowly turned into its own cms. the bio, the shelf, the study plan, even the kaomoji get edited live on the site; the repo just keeps the fallbacks. there’s also a vim command mode, a motion trial with a leaderboard, a guestbook, and a bonsai tree in here somewhere.",
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
      "an ai learning system living in my obsidian vault, named for the zone of proximal development by way of the nearest star still out of reach. the agent finds the edge of what i understand, teaches one reasoning step at a time, spars instead of lecturing, and logs every confusion, then schedules the rematch weeks later. one law holds it together: i generate first. it never does the thinking for me.",
    role: "designer, and the n of 1",
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
