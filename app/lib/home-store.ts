import { head } from "@vercel/blob";
import { DEFAULT_HOME, isValidHomeContent, type HomeContent } from "./home-content";

export const HOME_BLOB_PATH = "home/content.json";

export async function readHomeContent(): Promise<HomeContent> {
  try {
    const meta = await head(HOME_BLOB_PATH);
    const res = await fetch(`${meta.url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`blob fetch failed: ${res.status}`);
    const data: unknown = await res.json();
    if (isValidHomeContent(data)) return data;
  } catch {}
  return DEFAULT_HOME;
}
