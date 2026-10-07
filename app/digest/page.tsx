import type { Metadata } from "next";
import { DocsShell, type TocItem } from "../components/docs-shell";
import { TAG_ORDER, type Digest, type DigestItem, type DigestTag } from "../lib/digest-types";
import { readDigestForPage } from "../lib/digest-store";
import { DigestRefresh } from "./digest-refresh";
import s from "./digest.module.css";

export const metadata: Metadata = {
  title: "daily digest — russell jiang",
  description: "A daily AI-curated digest of tech news and research, filtered by Gemini.",
};

// re-read the blob at most twice an hour; a manual trigger shows up promptly,
// and the cron only writes once a day anyway.
export const revalidate = 1800;

// the table's columns: cursor, line number, priority, title, source. source
// folds into the summary line below sm, the way /writing drops its tags.
const COLS = "grid grid-cols-[2ch_1ch_minmax(0,1fr)] sm:grid-cols-[1ch_2ch_1ch_minmax(0,1fr)_14ch] gap-x-[1ch]";
// the summary starts under the title: three narrow cells plus their gaps
// (in the head's 13px ch, since the summary is set at 12px)
const UNDER_TITLE = "pl-[1ch] sm:pl-[calc(8ch*13/12)]";
const METER_CELLS = 10;

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

function sydneyDay(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" }).format(d);
}

// ─── header: a fetch-style readout on the left, a tag meter on the right ───

function Readout({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="m-0 grid grid-cols-[8ch_minmax(0,1fr)] gap-x-[1ch] text-[13px] leading-[1.75]">
      {rows.map(([key, value]) => (
        <div key={key} className="contents">
          <dt style={{ color: "var(--accent)" }}>{key}</dt>
          <dd className="m-0 min-w-0" style={{ color: "var(--ink)" }}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function TagMeter({ counts }: { counts: { tag: DigestTag; n: number }[] }) {
  const max = Math.max(1, ...counts.map((c) => c.n));
  return (
    <nav aria-label="jump to a tag" className="text-[13px] leading-[1.75]">
      <div
        className="grid grid-cols-[13ch_minmax(0,1fr)] gap-x-[1ch] px-[1ch] [&>span]:text-[11px] uppercase tracking-[0.08em]"
        style={{ color: "var(--faint)" }}
        aria-hidden="true"
      >
        <span>tag</span>
        <span>items</span>
      </div>
      {counts.map(({ tag, n }) => {
        const filled = Math.max(1, Math.round((n / max) * METER_CELLS));
        return (
          <a key={tag} href={`#${tagSlug(tag)}`} className="list-row block">
            <span className="list-head grid grid-cols-[13ch_minmax(0,1fr)] gap-x-[1ch] px-[1ch]">
              <span className="lowercase" style={{ color: "var(--ink)" }}>
                {tag}
              </span>
              <span className="whitespace-nowrap overflow-hidden">
                <span aria-hidden="true" style={{ color: "var(--accent)" }}>
                  {"━".repeat(filled)}
                </span>
                <span aria-hidden="true" className={s.track}>
                  {"─".repeat(METER_CELLS - filled)}
                </span>{" "}
                <span style={{ color: "var(--soft)" }}>{n}</span>
              </span>
            </span>
          </a>
        );
      })}
    </nav>
  );
}

// ─── the table ─────────────────────────────────────────────────────────────

function ColumnHeads() {
  return (
    <div
      className={`${COLS} px-[1ch] pb-1 [&>span]:text-[11px] uppercase tracking-[0.08em]`}
      style={{ color: "var(--faint)", borderBottom: "1px solid var(--line)" }}
      aria-hidden="true"
    >
      <span className="hidden sm:block" />
      <span>no</span>
      <span title="priority">★</span>
      <span>title</span>
      <span className="hidden sm:inline">source</span>
    </div>
  );
}

function Row({ item, n }: { item: DigestItem; n: number }) {
  const high = item.priority === "high";
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="list-row block py-2.5">
      <div className={`list-head ${COLS} px-[1ch]`}>
        <span className={`${s.ptr} hidden sm:block`} style={{ color: "var(--ink)" }} aria-hidden="true">
          ▹
        </span>
        <span style={{ color: "var(--faint)" }} aria-hidden="true">
          {String(n).padStart(2, "0")}
        </span>
        <span style={{ color: "var(--accent)" }}>
          {high ? (
            <>
              <span aria-hidden="true">★</span>
              <span className="sr-only">high priority:</span>
            </>
          ) : null}
        </span>
        <h3 className="m-0 text-[13px] font-normal" style={{ color: "var(--ink)" }}>
          {item.title}
          <span style={{ color: "var(--faint)" }} aria-hidden="true">
            {"\u00a0"}↗
          </span>
        </h3>
        <span
          className="hidden sm:block text-right truncate lowercase"
          style={{ color: "var(--soft)" }}
        >
          {item.source}
        </span>
      </div>
      <p
        className={`comment m-0 mt-1 ${UNDER_TITLE} pr-[1ch] text-[12px] leading-[1.75]`}
        style={{ color: "var(--soft)" }}
      >
        {item.summary}
        <span className="sm:hidden not-italic lowercase whitespace-nowrap" style={{ color: "var(--faint)" }}>
          {" "}— {item.source}
        </span>
      </p>
    </a>
  );
}

function Feed({ digest, present }: { digest: Digest; present: DigestTag[] }) {
  let n = 0;
  return (
    <div className="flex flex-col text-[13px]">
      <ColumnHeads />
      {present.map((tag) => {
        const items = digest.items
          .filter((it) => it.tag === tag)
          .sort((a, b) => Number(b.priority === "high") - Number(a.priority === "high"));
        return (
          <section key={tag} id={tagSlug(tag)} className="mt-6 first:mt-4">
            <h2
              className="m-0 mb-1 px-[1ch] flex items-baseline gap-[1ch] text-[13px] lowercase tracking-[0.15em]"
              style={{ color: "var(--ink)" }}
            >
              <span style={{ color: "var(--accent)" }}>##</span>
              <span>{tag}</span>
              <span className="text-[11px] tracking-normal" style={{ color: "var(--faint)" }}>
                {items.length}
              </span>
            </h2>
            {items.map((item) => (
              <Row key={item.url} item={item} n={++n} />
            ))}
          </section>
        );
      })}
      <div
        className="mt-6 pt-2 px-[1ch] flex items-baseline justify-between gap-4 text-[11px] lowercase"
        style={{ color: "var(--faint)", borderTop: "1px solid var(--line)" }}
      >
        <span>
          {digest.items.length} items · {present.length} tags
        </span>
        <span className={`${s.end} normal-case`}>(END)</span>
      </div>
    </div>
  );
}

// ─── page ──────────────────────────────────────────────────────────────────

export default async function DigestPage() {
  const digest = await readDigestForPage();

  const present: DigestTag[] = digest
    ? TAG_ORDER.filter((tag) => digest.items.some((it) => it.tag === tag))
    : [];
  const counts = present.map((tag) => ({
    tag,
    n: digest ? digest.items.filter((it) => it.tag === tag).length : 0,
  }));
  const toc: TocItem[] = present.map((tag) => ({
    label: tag,
    href: `#${tagSlug(tag)}`,
  }));

  const stamp = digest ? sydneyParts(digest.generatedAt) : null;
  const fresh = digest ? sydneyDay(new Date()) === sydneyDay(new Date(digest.generatedAt)) : false;
  const high = digest ? digest.items.filter((it) => it.priority === "high").length : 0;

  const rows: [string, React.ReactNode][] =
    digest && stamp
      ? [
          ["date", stamp.date],
          [
            "run",
            <>
              {stamp.time} {stamp.zone.toLowerCase()}{" "}
              {fresh ? (
                <span style={{ color: "var(--ok)" }}>● today</span>
              ) : (
                <span style={{ color: "var(--soft)" }}>○ stale</span>
              )}
            </>,
          ],
          [
            "items",
            <>
              {digest.items.length}
              {high > 0 && (
                <span style={{ color: "var(--soft)" }}>
                  {" "}· <span style={{ color: "var(--accent)" }}>★</span> {high} high
                </span>
              )}
            </>,
          ],
          ["sources", `${digest.sourceCount} feeds read`],
          ["curator", "gemini"],
        ]
      : [
          ["date", sydneyParts(new Date().toISOString()).date],
          ["run", <span key="run" style={{ color: "var(--soft)" }}>○ none yet</span>],
          ["next", "~6–7am sydney"],
          ["curator", "gemini"],
        ];

  return (
    <DocsShell crumb="digest" toc={toc}>
      <h1 className="display text-[26px] leading-[1.4]" style={{ color: "var(--ink)" }}>
        daily digest
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        curated daily from across the web, filtered and summarised by gemini.
      </p>

      <div className="hrule my-8" />

      <div className="grid grid-cols-1 gap-y-6 gap-x-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Readout rows={rows} />
        {digest && <TagMeter counts={counts} />}
      </div>

      {digest && !fresh && (
        <p className="comment mt-4 mb-0 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
          today&apos;s run hasn&apos;t landed yet — this is the last one.
        </p>
      )}

      <DigestRefresh />

      <div className="mt-10">
        {!digest ? (
          <div className="text-[13px] leading-[1.75]">
            <p className="m-0" style={{ color: "var(--ink)" }}>
              <span style={{ color: "var(--rose)" }}>❯</span> cat digest/latest.json
            </p>
            <p className="m-0" style={{ color: "var(--soft)" }}>
              cat: digest/latest.json: no such file or directory
            </p>
            <p
              className="comment mt-6 mb-0 text-[12px] lowercase"
              style={{ color: "var(--soft)" }}
            >
              the first digest lands tomorrow morning, around 6–7am sydney time. it
              reads ai labs, arxiv, hacker news and a handful of good feeds, then
              keeps the dozen things worth knowing.
            </p>
          </div>
        ) : (
          <Feed digest={digest} present={present} />
        )}
      </div>
    </DocsShell>
  );
}
