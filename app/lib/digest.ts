import { XMLParser } from "fast-xml-parser";
import {
  DIGEST_TAGS,
  type Digest,
  type DigestItem,
  type DigestPriority,
  type DigestTag,
} from "./digest-types";
import { readLatestDigest } from "./digest-store";

// ── sources ────────────────────────────────────────────────────────────────
// handpicked for signal: ai labs + a few high-quality aggregators + capped
// arxiv + the best science writing. funding/gadget/pr feeds were dropped on
// purpose (the curator prompt excludes that content anyway). add a source back
// by adding one line here.

interface Feed {
  name: string;
  url: string;
  cap: number;
}

const FEEDS: Feed[] = [
  // ai / ml labs — weighted heavily by the curator prompt.
  // anthropic publishes no public rss (all paths 404); its news still arrives
  // via simon willison / hn / tldr, where the "weight anthropic" rule applies.
  { name: "Simon Willison", url: "https://simonwillison.net/atom/everything", cap: 15 },
  { name: "OpenAI", url: "https://openai.com/news/rss.xml", cap: 10 },
  { name: "Google DeepMind", url: "https://deepmind.google/blog/rss.xml", cap: 10 },
  { name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml", cap: 10 },
  // research — firehoses, capped hard; the prompt filters applied-over-theory
  { name: "arXiv cs.AI", url: "https://arxiv.org/rss/cs.AI", cap: 15 },
  { name: "arXiv cs.LG", url: "https://arxiv.org/rss/cs.LG", cap: 15 },
  { name: "arXiv quant-ph", url: "https://arxiv.org/rss/quant-ph", cap: 15 },
  // science / broad tech
  { name: "Quanta Magazine", url: "https://www.quantamagazine.org/feed", cap: 10 },
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", cap: 12 },
  // dev / builder aggregators
  { name: "Lobsters", url: "https://lobste.rs/rss", cap: 15 },
  { name: "TLDR", url: "https://tldr.tech/api/rss/tech", cap: 15 },
];

const HN_TOP = "https://hacker-news.firebaseio.com/v0/topstories.json";
const HN_ITEM = (id: number) => `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
const HN_TAKE = 30;
const HN_KEEP = 15;

const HN_KEYWORDS = [
  "ai",
  "ml",
  "llm",
  "gpt",
  "claude",
  "gemini",
  "model",
  "neural",
  "transformer",
  "diffusion",
  "agent",
  "inference",
  "training",
  "quantum",
  "qubit",
  "compiler",
  "rust",
  "typescript",
  "python",
  "database",
  "kernel",
  "open source",
  "open-source",
  "dataset",
  "embedding",
  "vector",
  "gpu",
  "cuda",
];

const FETCH_TIMEOUT_MS = 8000;
const FRESH_WINDOW_MS = 30 * 60 * 60 * 1000; // 30h — daily, with slack for gaps
const MAX_ITEMS_TO_MODEL = 220;
const DESC_MAX = 300;
const USER_AGENT = "russelljiang.com digest (+https://russelljiang.com)";

// ── raw item ───────────────────────────────────────────────────────────────

interface RawItem {
  title: string;
  url: string;
  source: string;
  description: string;
  date: number | null; // ms epoch, null if unknown
}

// ── fetching + parsing ───────────────────────────────────────────────────────

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
});

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { "user-agent": USER_AGENT, accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function textOf(node: unknown): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    if (typeof o["#text"] === "string") return o["#text"];
  }
  return "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parseDate(value: unknown): number | null {
  const s = textOf(value).trim();
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t;
}

// atom <link> can be a string, an object with @_href, or an array of those
function atomLink(entry: Record<string, unknown>): string {
  const link = entry.link;
  if (typeof link === "string") return link;
  const links = asArray(link as unknown);
  let fallback = "";
  for (const l of links) {
    if (l && typeof l === "object") {
      const o = l as Record<string, unknown>;
      const href = typeof o["@_href"] === "string" ? o["@_href"] : "";
      if (!href) continue;
      if (o["@_rel"] === "alternate" || o["@_rel"] === undefined) return href;
      fallback = fallback || href;
    }
  }
  return fallback;
}

function extractItems(xml: string, source: string): RawItem[] {
  let parsed: Record<string, unknown>;
  try {
    parsed = parser.parse(xml) as Record<string, unknown>;
  } catch {
    return [];
  }

  // rss 2.0: rss > channel > item[]
  const rss = parsed.rss as Record<string, unknown> | undefined;
  const channel = rss?.channel as Record<string, unknown> | undefined;
  if (channel) {
    return asArray(channel.item).map((raw) => {
      const it = raw as Record<string, unknown>;
      return {
        title: stripHtml(textOf(it.title)),
        url: textOf(it.link).trim(),
        source,
        description: stripHtml(textOf(it.description) || textOf(it["content:encoded"])).slice(0, DESC_MAX),
        date: parseDate(it.pubDate) ?? parseDate(it["dc:date"]),
      };
    });
  }

  // rdf (older arxiv / rss 1.0): rdf:RDF > item[]
  const rdf = (parsed["rdf:RDF"] || parsed.RDF) as Record<string, unknown> | undefined;
  if (rdf) {
    return asArray(rdf.item).map((raw) => {
      const it = raw as Record<string, unknown>;
      return {
        title: stripHtml(textOf(it.title)),
        url: textOf(it.link).trim(),
        source,
        description: stripHtml(textOf(it.description)).slice(0, DESC_MAX),
        date: parseDate(it["dc:date"]),
      };
    });
  }

  // atom: feed > entry[]
  const feed = parsed.feed as Record<string, unknown> | undefined;
  if (feed) {
    return asArray(feed.entry).map((raw) => {
      const it = raw as Record<string, unknown>;
      return {
        title: stripHtml(textOf(it.title)),
        url: atomLink(it).trim(),
        source,
        description: stripHtml(textOf(it.summary) || textOf(it.content)).slice(0, DESC_MAX),
        date: parseDate(it.updated) ?? parseDate(it.published),
      };
    });
  }

  return [];
}

async function fetchFeed(feed: Feed): Promise<RawItem[]> {
  const xml = await fetchText(feed.url);
  const items = extractItems(xml, feed.name)
    .filter((it) => it.title && it.url)
    // newest first when dated, then take the cap
    .sort((a, b) => (b.date ?? 0) - (a.date ?? 0))
    .slice(0, feed.cap);
  return items;
}

interface HNStory {
  title?: string;
  url?: string;
  score?: number;
  time?: number; // seconds epoch
  type?: string;
}

async function fetchHackerNews(): Promise<RawItem[]> {
  const ids = JSON.parse(await fetchText(HN_TOP)) as number[];
  const top = ids.slice(0, HN_TAKE);
  const stories = await Promise.allSettled(
    top.map(async (id) => JSON.parse(await fetchText(HN_ITEM(id))) as HNStory)
  );
  const items: RawItem[] = [];
  for (const s of stories) {
    if (s.status !== "fulfilled" || !s.value) continue;
    const story = s.value;
    if (!story.title || !story.url) continue; // skip Ask HN self-posts
    const hay = story.title.toLowerCase();
    if (!HN_KEYWORDS.some((k) => hay.includes(k))) continue;
    items.push({
      title: story.title,
      url: story.url,
      source: "Hacker News",
      description: `HN front page · ${story.score ?? 0} points`,
      date: story.time ? story.time * 1000 : null,
    });
  }
  return items.slice(0, HN_KEEP);
}

// ── dedup + freshness ────────────────────────────────────────────────────────

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    for (const p of [...u.searchParams.keys()]) {
      if (p.startsWith("utm_") || p === "ref" || p === "source") u.searchParams.delete(p);
    }
    let s = `${u.host}${u.pathname}`.toLowerCase();
    s = s.replace(/\/$/, "");
    const q = u.searchParams.toString();
    return q ? `${s}?${q}` : s;
  } catch {
    return url.trim().toLowerCase();
  }
}

function dedupeAndFreshen(items: RawItem[]): RawItem[] {
  const now = Date.now();
  const seen = new Set<string>();
  const out: RawItem[] = [];
  for (const it of items) {
    // drop items that are confidently stale; keep undated ones (let the model judge)
    if (it.date !== null && now - it.date > FRESH_WINDOW_MS) continue;
    const key = normalizeUrl(it.url);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  // newest-known first, then cap the volume sent to the model
  out.sort((a, b) => (b.date ?? now) - (a.date ?? now));
  return out.slice(0, MAX_ITEMS_TO_MODEL);
}

// ── gemini curation (free tier; structured json output for valid json) ───────
// the whole llm integration is this one function + the schema below, so
// switching providers (e.g. back to anthropic) is a localized change.

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

const SYSTEM_PROMPT = `You are a highly selective tech news curator for a computer science and data science student interested in AI, applied machine learning, quantum computing, and developer tools. Your job is to filter a raw list of news items down to the 10-12 most significant and actionable items from the past 24 hours. Prioritise: new model releases, new capabilities, applied AI breakthroughs, quantum computing developments, significant open source releases, and genuinely important developer tool updates. Deprioritise and exclude: funding rounds unless transformative, company drama or gossip, crypto/blockchain, opinion pieces with no new information, pure academic theory with no near-term application, and marketing announcements. Weight Simon Willison, Anthropic, OpenAI, and DeepMind sources most heavily. For each selected item, provide: title, summary (exactly 2 sentences, written for a technically literate reader), source (publication name), url (use the exact url provided for that item), tag (one of: AI, Quantum, Dev Tools, Applied Tech, Open Source, Research), and priority (high or medium). Return a JSON object with an "items" array of the selected items. If the previous digest's urls are provided, do not repeat them unless there is a major new development.`;

// gemini structured-output schema (openapi subset — uppercase type names)
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          summary: { type: "STRING" },
          source: { type: "STRING" },
          url: { type: "STRING" },
          tag: { type: "STRING", enum: [...DIGEST_TAGS] },
          priority: { type: "STRING", enum: ["high", "medium"] },
        },
        required: ["title", "summary", "source", "url", "tag", "priority"],
        propertyOrdering: ["title", "summary", "source", "url", "tag", "priority"],
      },
    },
  },
  required: ["items"],
  propertyOrdering: ["items"],
};

async function curate(items: RawItem[], excludeUrls: string[]): Promise<DigestItem[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const payload = items.map((it) => ({
    title: it.title,
    url: it.url,
    source: it.source,
    description: it.description,
  }));

  const userContent =
    `Here are today's raw items as a JSON array:\n${JSON.stringify(payload)}` +
    (excludeUrls.length
      ? `\n\nThese urls were in the previous digest; exclude them unless there is a major new development:\n${JSON.stringify(excludeUrls)}`
      : "");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userContent }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.4,
          maxOutputTokens: 8192,
        },
      }),
      signal: AbortSignal.timeout(50_000),
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`gemini ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("gemini returned no content");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("gemini returned invalid json");
  }
  const raw = (parsed as { items?: unknown })?.items;
  if (!Array.isArray(raw)) throw new Error("gemini returned no digest items");

  return raw
    .map(coerceItem)
    .filter((x): x is DigestItem => x !== null)
    .slice(0, 12);
}

function coerceItem(value: unknown): DigestItem | null {
  if (typeof value !== "object" || value === null) return null;
  const o = value as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const summary = typeof o.summary === "string" ? o.summary.trim() : "";
  const source = typeof o.source === "string" ? o.source.trim() : "";
  const url = typeof o.url === "string" ? o.url.trim() : "";
  const tag = o.tag as DigestTag;
  const priority = o.priority as DigestPriority;
  if (!title || !summary || !url) return null;
  if (!/^https?:\/\//.test(url)) return null;
  if (!(DIGEST_TAGS as readonly string[]).includes(tag)) return null;
  if (priority !== "high" && priority !== "medium") return null;
  return { title, summary, source: source || "web", url, tag, priority };
}

// ── orchestration ────────────────────────────────────────────────────────────

export async function runDigest(): Promise<Digest> {
  const results = await Promise.allSettled([
    ...FEEDS.map((f) => fetchFeed(f)),
    fetchHackerNews(),
  ]);

  const raw: RawItem[] = [];
  let sourceCount = 0;
  results.forEach((r, i) => {
    const label = i < FEEDS.length ? FEEDS[i].name : "Hacker News";
    if (r.status === "fulfilled") {
      if (r.value.length > 0) sourceCount++;
      raw.push(...r.value);
    } else {
      console.error(`digest: source failed (${label}):`, r.reason);
    }
  });

  const fresh = dedupeAndFreshen(raw);
  if (fresh.length === 0) throw new Error("no fresh items from any source");

  // avoid repeating yesterday's picks
  let excludeUrls: string[] = [];
  try {
    const prev = await readLatestDigest();
    if (prev) excludeUrls = prev.items.map((it) => it.url).slice(0, 30);
  } catch {}

  const items = await curate(fresh, excludeUrls);
  if (items.length === 0) throw new Error("curation returned zero items");

  return {
    items,
    generatedAt: new Date().toISOString(),
    itemCount: items.length,
    sourceCount,
  };
}

// ── sydney time helpers (shared by routes + page) ────────────────────────────

export function sydneyDateString(d: Date = new Date()): string {
  // en-CA renders YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" }).format(d);
}
