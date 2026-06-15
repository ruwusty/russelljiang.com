import type { Metadata } from "next";
import { DocsShell, type TocItem } from "../components/docs-shell";
import { TAG_ORDER, type DigestItem, type DigestTag } from "../lib/digest-types";
import { readLatestDigest } from "../lib/digest-store";
import { DigestRefresh } from "./digest-refresh";

export const metadata: Metadata = {
  title: "daily digest — russell jiang",
  description: "A daily AI-curated digest of tech news and research, filtered by Gemini.",
};

// re-read the blob at most twice an hour; a manual trigger shows up promptly,
// and the cron only writes once a day anyway.
export const revalidate = 1800;

function tagSlug(tag: DigestTag): string {
  return tag.toLowerCase().replace(/\s+/g, "-");
}

function sydneyParts(iso: string): { date: string; time: string; zone: string } {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  const timeParts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).formatToParts(d);
  const time = timeParts
    .filter((p) => ["hour", "literal", "minute", "dayPeriod"].includes(p.type))
    .map((p) => p.value)
    .join("")
    .trim();
  const zone = timeParts.find((p) => p.type === "timeZoneName")?.value ?? "AEST";
  return { date: date.toLowerCase(), time: time.toLowerCase().replace(/\s+/g, ""), zone };
}

function Item({ item }: { item: DigestItem }) {
  const high = item.priority === "high";
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block py-5"
      style={{ textDecoration: "none", borderTop: "1px solid var(--line)" }}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[15px]" style={{ color: "var(--ink)" }}>
          <span style={{ color: high ? "var(--accent)" : "var(--faint)" }}>▸</span>{" "}
          {item.title}
        </h3>
        {high && (
          <span className="shrink-0 text-[11px] lowercase" style={{ color: "var(--accent)" }}>
            ★ high
          </span>
        )}
      </div>
      <p className="mt-1 pl-5 text-[14px] leading-[1.9]" style={{ color: "var(--soft)" }}>
        {item.summary}
      </p>
      <div
        className="mt-1.5 pl-5 flex items-baseline gap-2 text-[11px] lowercase"
        style={{ color: "var(--faint)" }}
      >
        <span>[{item.tag.toLowerCase()}]</span>
        <span>·</span>
        <span>{item.source}</span>
      </div>
    </a>
  );
}

export default async function DigestPage() {
  const digest = await readLatestDigest();

  const present: DigestTag[] = digest
    ? TAG_ORDER.filter((tag) => digest.items.some((it) => it.tag === tag))
    : [];
  const toc: TocItem[] = present.map((tag) => ({
    label: tag,
    href: `#${tagSlug(tag)}`,
  }));

  const stamp = digest ? sydneyParts(digest.generatedAt) : null;
  const today = digest
    ? new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" }).format(new Date()) ===
      new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" }).format(
        new Date(digest.generatedAt)
      )
    : false;

  return (
    <DocsShell crumb="digest" toc={toc}>
      <h1 className="display text-[26px] leading-[1.4]" style={{ color: "var(--ink)" }}>
        daily digest
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        {stamp ? stamp.date : "loading…"}
      </p>
      <p className="mt-1 text-[12px] lowercase" style={{ color: "var(--faint)" }}>
        curated daily from across the web, filtered and summarised by gemini.
      </p>

      <DigestRefresh />

      <div className="hrule my-8" />

      {!digest ? (
        <p className="text-[13px] leading-[1.9] lowercase" style={{ color: "var(--soft)" }}>
          the first digest lands tomorrow morning, around 6–7am sydney time.
          <br />
          <span style={{ color: "var(--faint)" }}>
            it reads ai labs, arxiv, hacker news, and a handful of good feeds,
            then keeps the dozen things worth knowing.
          </span>
        </p>
      ) : (
        <>
          {!today && (
            <p className="mb-8 text-[11px] lowercase" style={{ color: "var(--faint)" }}>
              ❯ note: today&apos;s run hasn&apos;t landed yet — showing the last digest.
            </p>
          )}

          {present.map((tag, i) => {
            const items = digest.items
              .filter((it) => it.tag === tag)
              .sort((a, b) => Number(b.priority === "high") - Number(a.priority === "high"));
            return (
              <section key={tag} id={tagSlug(tag)} className="mt-12 first:mt-0">
                <h2
                  className="text-[13px] lowercase tracking-[0.15em]"
                  style={{ color: "var(--ink)" }}
                >
                  <span style={{ color: "var(--faint)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>{" "}
                  {tag.toLowerCase()}
                </h2>
                <div className="mt-3 flex flex-col">
                  {items.map((item) => (
                    <Item key={item.url} item={item} />
                  ))}
                  <div style={{ borderTop: "1px solid var(--line)" }} />
                </div>
              </section>
            );
          })}

          <p className="mt-12 text-[11px] lowercase" style={{ color: "var(--faint)" }}>
            last updated: {stamp?.time} {stamp?.zone.toLowerCase()} · {digest.itemCount} items ·
            curated by gemini
          </p>
        </>
      )}
    </DocsShell>
  );
}
