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
  { label: "claude-hub", href: "#claude-hub" },
  { label: "scoop", href: "#scoop" },
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
      "a tutoring platform for sydney students, at six-figure-plus revenue and 200 seats a term. i’ve been its sole engineer since march 2026: the admin, tutor and student portals, the pipeline that turns a trial class into a term enrolment, the email and notification machinery, and an ai tutor whose rag pipeline reads the class material and nothing it shouldn’t. it ships with its own eval harness (retrieval, generation, behaviour) and a privacy suite that fails ci before a leak fails a family.",
    role: "sole engineer. everything from the schema to the pixels, plus the ai tutor end to end (ingestion, retrieval, evals)",
    stack: "React · TypeScript · Supabase (Postgres, edge functions) · Claude",
    links: [{ label: "sydneyscholars.com", href: "https://sydneyscholars.com" }],
  },
  {
    id: "this-site",
    index: "02",
    name: "this site",
    claim:
      "my corner of the internet: a tui you can read in a browser, which slowly turned into its own cms. tiled panes, a command line with history and tab completion, and a fastfetch that pairs your machine with one of fourteen ascii logos. the bio, the shelf, the study plan, even the kaomoji get edited live on the site; the repo just keeps the fallbacks. there’s also a vim motion trial with a leaderboard, a guestbook, a daily digest curated from sixteen feeds, and a bonsai tree in here somewhere.",
    role: "everything, with a pair programmer",
    stack: "Next.js 15 · React 19 · Tailwind · Vercel Blob · Maple Mono",
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
      "an ai learning system living in my obsidian vault, named for the zone of proximal development by way of the nearest star still out of reach. the agent finds the edge of what i understand, teaches one reasoning step at a time, spars instead of lecturing, and logs every confusion to a longitudinal edges log. each edge comes back for a rematch on a widening ladder until it holds, then retires as durable. it's still self-graded, so the real test is a closed-book exam. one law holds it together: i generate first. it never does the thinking for me.",
    role: "designer, and the learner it grades",
    stack: "claude code · obsidian · plain markdown, on purpose",
    links: [{ label: "the philosophy", href: "/writing/the-same-shape-everywhere" }],
  },
  {
    id: "claude-hub",
    index: "04",
    name: "claude-hub",
    claim:
      "two claude code sessions on two accounts, one chat room, and me in the middle. it exists because the pair kept doing the same work at the same time without asking each other. now the hub decides whose turn a task is, pushes a direction board and a claim board into every prompt, watches which files each one actually writes, and says so in the room the moment both write the same one. there's a mission control with a git graph per lane, a board of things only i can do, and a ui that borrows its layout from claude code and its clothes from this site.",
    role: "designer, operator, and the tiebreaker",
    stack: "Node · Express · WebSockets · Claude Agent SDK · vanilla js, no build step",
    links: [],
  },
  {
    id: "scoop",
    index: "05",
    name: "scoop",
    claim:
      "a daily beach game: read the morning paper, read the rival ice cream vendors, and park your cart where the crowd will be. it's hotelling's model of competition with a newspaper clipping in front. the crowd stays hidden, the clipping hints at it, and every vendor follows one rule you can read by eye, including a shadow that sets up beside whoever's selling the most. forty-three twists, each with its own pixel art, and a script that refuses to ship two twists that make the same puzzle.",
    role: "designer and builder, with a pair programmer",
    stack: "Next.js 15 · React 19 · canvas pixel art · no backend",
    links: [{ label: "scoop.russelljiang.com", href: "https://scoop.russelljiang.com" }],
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
              {project.links.length === 0 && (
                <span style={{ color: "var(--soft)" }}>private repo</span>
              )}
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
