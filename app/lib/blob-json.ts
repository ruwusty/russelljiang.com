import { head, put } from "@vercel/blob";

// every editable feature is one json blob. these two are the whole storage
// layer: callers validate what comes back, and treat null as "nothing stored
// yet, or blob not configured" and fall back to their defaults.
export async function readJson(path: string): Promise<unknown> {
  try {
    const meta = await head(path);
    // blob urls are cdn-cached; the query param + no-store gets the latest write
    const res = await fetch(`${meta.url}?v=${Date.now()}`, { cache: "no-store" });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function writeJson(path: string, data: unknown): Promise<void> {
  await put(path, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}
