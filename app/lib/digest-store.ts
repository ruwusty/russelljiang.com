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
