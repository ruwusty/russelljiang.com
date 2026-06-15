// shared shapes for the daily digest. kept separate so the page (client-free
// server component) and the lib can both import without pulling in node deps.

export const DIGEST_TAGS = [
  "AI",
  "Quantum",
  "Dev Tools",
  "Applied Tech",
  "Open Source",
  "Research",
] as const;

export type DigestTag = (typeof DIGEST_TAGS)[number];
export type DigestPriority = "high" | "medium";

export interface DigestItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  tag: DigestTag;
  priority: DigestPriority;
}

export interface Digest {
  items: DigestItem[];
  generatedAt: string; // ISO 8601 (UTC)
  itemCount: number;
  sourceCount: number; // feeds that fetched successfully
}

// tag display order on the page: ai first, then quantum, then the rest
export const TAG_ORDER: DigestTag[] = [
  "AI",
  "Quantum",
  "Dev Tools",
  "Applied Tech",
  "Open Source",
  "Research",
];

export function isDigest(value: unknown): value is Digest {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (typeof o.generatedAt !== "string") return false;
  if (!Array.isArray(o.items)) return false;
  return o.items.every((it) => {
    if (typeof it !== "object" || it === null) return false;
    const r = it as Record<string, unknown>;
    return (
      typeof r.title === "string" &&
      typeof r.summary === "string" &&
      typeof r.source === "string" &&
      typeof r.url === "string" &&
      typeof r.tag === "string" &&
      (DIGEST_TAGS as readonly string[]).includes(r.tag) &&
      (r.priority === "high" || r.priority === "medium")
    );
  });
}
