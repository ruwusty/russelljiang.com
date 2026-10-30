import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";

export const metadata: Metadata = {
  title: "games — russell jiang",
  description: "Small games I make.",
};

const toc = [
  { label: "scoop", href: "#scoop" },
  { label: "late", href: "#late" },
];

interface Game {
  id: string;
  index: string;
  name: string;
  claim: string;
  play: string;
  links: { label: string; href: string }[];
}

const games: Game[] = [
  {
    id: "scoop",
    index: "01",
    name: "scoop",
    claim:
      "a daily beach game: read the morning paper, read the rival ice cream vendors, and park your cart where the crowd will be. it's hotelling's model of competition with a newspaper clipping in front. the crowd stays hidden, the clipping hints at it, and every vendor follows one rule you can read by eye, including a shadow that sets up beside whoever's selling the most. forty-three twists, each with its own pixel art, and a script that refuses to ship two twists that make the same puzzle.",
    play: "one beach a day, plus unlimited",
    links: [{ label: "scoop.russelljiang.com", href: "https://scoop.russelljiang.com" }],
  },
  {
    id: "late",
    index: "02",
    name: "late",
    claim:
      "allow extra time. get across port wattle to every stop on today's list, on a day its trains are having. the clock only moves when you do: stay on or get off, wait for the express, walk to the metro. trackwork, signal faults and floods all happen on schedule, and the only warning is a feed full of people shouting into the void, some of whom are right.",
    play: "as many days as you like",
    links: [],
  },
];

export default function GamesPage() {
  return (
    <DocsShell crumb="games" toc={toc}>
      <h1
        className="display text-[26px] leading-[1.4]"
        style={{ color: "var(--ink)" }}
      >
        games
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        small games, made for the bus.
      </p>

      <div className="hrule my-8" />

      {games.map((game) => (
        <section key={game.id} id={game.id} className="mt-14 first:mt-0">
          <h2
            className="text-[13px] lowercase tracking-[0.15em]"
            style={{ color: "var(--ink)" }}
          >
            <span style={{ color: "var(--faint)" }}>{game.index}</span>{" "}
            {game.name}
          </h2>
          <p
            className="mt-3 text-[14px] leading-[1.9]"
            style={{ color: "var(--soft)" }}
          >
            {game.claim}
          </p>
          <dl
            className="mt-4 text-[13px] grid grid-cols-[70px_1fr] gap-y-1"
            style={{ color: "var(--soft)" }}
          >
            <dt className="text-[12px]" style={{ color: "var(--soft)" }}>
              play
            </dt>
            <dd className="lowercase">{game.play}</dd>
            <dt className="text-[12px]" style={{ color: "var(--soft)" }}>
              links
            </dt>
            <dd className="flex items-baseline gap-3">
              {game.links.length === 0 && (
                <span style={{ color: "var(--soft)" }}>soon</span>
              )}
              {game.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="site-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                  <span className="text-[11px]" style={{ color: "var(--faint)" }}>
                    {" "}
                    ↗
                  </span>
                </a>
              ))}
            </dd>
          </dl>
        </section>
      ))}
    </DocsShell>
  );
}
