// the writing index, in one place. both the /writing page and the command
// bar's `grep` read from here, so the two cannot disagree about what exists.

export interface Post {
  title: string;
  description: string;
  date: string;
  tags: string[];
  published: string;
  href?: string;
}

export const posts: Post[] = [
  {
    title: "The Wrong Side of the Black Box",
    description:
      "On typesafe ai's jev, a model that answers with probabilities instead of prose, and why most AI engineering tooling lives on the wrong side of the black box.",
    date: "2026-09-17",
    tags: ["ai", "engineering"],
    published: "personal",
    href: "/writing/the-wrong-side-of-the-black-box",
  },
  {
    title: "The Tutor That Refuses to Answer",
    description:
      "On AI tutors, the outsourcing trap, and a learning system whose one unbreakable rule is that the struggle stays mine.",
    date: "2026-08-24",
    tags: ["ai", "learning"],
    published: "personal",
    href: "/writing/the-tutor-that-refuses-to-answer",
  },
  {
    title: "The Boulder and the Ladder",
    description:
      "Why ranked stopped feeling good: zero sum ladders, positive sum hobbies, and the slow migration between them.",
    date: "2026-07-16",
    tags: ["games", "motivation"],
    published: "personal",
    href: "/writing/the-boulder-and-the-ladder",
  },
  {
    title: "The Same Shape Everywhere",
    description:
      "A meditation on pattern recognition, and what physics might have to say about how to live.",
    date: "2026-06-25",
    tags: ["maths", "physics", "philosophy"],
    published: "personal",
    href: "/writing/the-same-shape-everywhere",
  },
  {
    title: "Vibe Coding Won't Save You",
    description: "Why fundamentals still matter in the age of agentic AI.",
    date: "2026-04-12",
    tags: ["opinion", "ai"],
    published: "DataSoc",
    href: "/writing/vibe-coding-wont-save-you",
  },
];

/** case-insensitive substring match over title, description and tags.
 *  returns published posts only — drafts have no href and are not for grep. */
export function grepPosts(term: string): Post[] {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  return posts.filter(
    (p) =>
      p.href &&
      (p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)))
  );
}
