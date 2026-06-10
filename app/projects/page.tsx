import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";

export const metadata: Metadata = {
  title: "projects — russell jiang",
  description: "Things I build and maintain.",
};

const toc = [
  { label: "Sydney Scholars", href: "#sydney-scholars" },
  { label: "This site", href: "#this-site" },
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
      "a tutoring platform for sydney students. i work on the systems side: the admin and tutor portals — session workflows, lesson planning, incident and safety logging — plus a rag pipeline that grounds the ai tutor in class reference material, with privacy guardrails on what it's allowed to see.",
    role: "systems — admin/tutor portal, rag pipeline (ingestion, retrieval, evals)",
    stack: "React · TypeScript · Supabase (Postgres, edge functions)",
    links: [{ label: "sydneyscholars.com", href: "https://sydneyscholars.com" }],
  },
  {
    id: "this-site",
    index: "02",
    name: "this site",
    claim:
      "a personal site that became its own cms. every piece of content — bio, plan, presets, the currently line, even the kaomoji — is editable on-site behind one password, stored in vercel blob. plus a vim command mode, a guestbook, and a motion-practice minigame with leaderboards.",
    role: "everything, with a pair programmer",
    stack: "Next.js 15 · React 19 · Tailwind · Vercel Blob",
    links: [
      { label: "source", href: "https://github.com/ruwusty/russelljiang.com" },
      { label: "you are here", href: "/" },
    ],
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
            <dt className="text-[12px]" style={{ color: "var(--faint)" }}>
              role
            </dt>
            <dd className="lowercase">{project.role}</dd>
            <dt className="text-[12px]" style={{ color: "var(--faint)" }}>
              stack
            </dt>
            <dd>{project.stack}</dd>
            <dt className="text-[12px]" style={{ color: "var(--faint)" }}>
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
