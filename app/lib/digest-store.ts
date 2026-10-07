import { head, put } from "@vercel/blob";
import { isDigest, type Digest } from "./digest-types";

const LATEST_PATH = "digest/latest.json";

export async function readLatestDigest(): Promise<Digest | null> {
  try {
    const meta = await head(LATEST_PATH);
    const res = await fetch(`${meta.url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`blob fetch failed: ${res.status}`);
    const data: unknown = await res.json();
    if (isDigest(data)) return data;
  } catch {}
  return null;
}

// what /digest renders. in `next dev` with no blob (no token locally), fall
// back to an invented fixture so the page can be designed against real-looking
// content; DIGEST_FIXTURE=off shows the empty state instead. the generator
// keeps calling readLatestDigest() directly, so it never sees the fixture, and
// next inlines NODE_ENV at build, so production can't reach this branch.
export async function readDigestForPage(): Promise<Digest | null> {
  const digest = await readLatestDigest();
  if (digest) return digest;
  if (process.env.NODE_ENV === "development" && process.env.DIGEST_FIXTURE !== "off") {
    const { digestFixture } = await import("./digest-fixture");
    return digestFixture();
  }
  return null;
}

export async function writeDigest(digest: Digest, dateKey: string): Promise<void> {
  const body = JSON.stringify(digest);
  const opts = {
    access: "public" as const,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  };
  // latest powers the page; the dated copy is the archive
  await put(LATEST_PATH, body, opts);
  await put(`digest/${dateKey}.json`, body, opts);
}
