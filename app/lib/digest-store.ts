import { readJson, writeJson } from "./blob-json";
import { isDigest, type Digest } from "./digest-types";

const LATEST_PATH = "digest/latest.json";

export async function readLatestDigest(): Promise<Digest | null> {
  const data = await readJson(LATEST_PATH);
  return isDigest(data) ? data : null;
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
  // latest powers the page; the dated copy is the archive
  await writeJson(LATEST_PATH, digest);
  await writeJson(`digest/${dateKey}.json`, digest);
}
