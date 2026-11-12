import { readJson } from "./blob-json";
import { DEFAULT_HOME, isValidHomeContent, type HomeContent } from "./home-content";

export const HOME_BLOB_PATH = "home/content.json";

export async function readHomeContent(): Promise<HomeContent> {
  const data = await readJson(HOME_BLOB_PATH);
  return isValidHomeContent(data) ? data : DEFAULT_HOME;
}
