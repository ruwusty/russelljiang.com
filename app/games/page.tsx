import type { Metadata } from "next";
import { DocsShell } from "../components/docs-shell";

export const metadata: Metadata = {
  title: "games — russell jiang",
  description: "Small games I make.",
};

const toc = [
  { label: "scoop", href: "#scoop" },
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
      "a daily beach game: fifteen spots along the water, a crowd you can count, and two rival ice cream carts. hal never moves. shadow sam sets up next to whoever's selling the most, which could be you. everyone buys from the nearest cart, so it's hotelling's model of competition on one line. the busiest spot is the right answer about a third of the time.",
    play: "one beach a day, plus unlimited",
    links: [{ label: "scoop.russelljiang.com", href: "https://scoop.russelljiang.com" }],
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
