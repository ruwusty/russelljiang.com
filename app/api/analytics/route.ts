import { list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { passwordOk } from "../_lib/auth";
import { sydneyDateString } from "../../lib/digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_DAYS = 30;
const MAX_PAGES_PER_DAY = 20; // 20k hits/day before a day is undercounted

interface DayStats {
  day: string;
  views: number;
  uniques: number;
}

const sydneyDayOffset = (daysAgo: number) =>
  sydneyDateString(new Date(Date.now() - daysAgo * 86_400_000));

function top(map: Map<string, number>, n: number): [string, number][] {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

// owner-only. reads the pathnames written by /api/hit — never the bodies.
export async function GET(req: Request) {
  if (!passwordOk(req.headers.get("x-site-password"))) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  const wanted = Number(new URL(req.url).searchParams.get("days") ?? 7);
  const days = Math.min(MAX_DAYS, Math.max(1, Number.isFinite(wanted) ? Math.floor(wanted) : 7));

  const byDay: DayStats[] = [];
  const pages = new Map<string, number>();
  const refs = new Map<string, number>();

  for (let i = 0; i < days; i++) {
    const day = sydneyDayOffset(i);
    const prefix = `hits/${day}/`;
    const seen = new Set<string>();
    let views = 0;
    let cursor: string | undefined;
    for (let page = 0; page < MAX_PAGES_PER_DAY; page++) {
      const res = await list({ prefix, limit: 1000, cursor });
      for (const blob of res.blobs) {
        // hits/<day>/<hash>,<path>,<ref>-<random>.txt
        const name = blob.pathname.slice(prefix.length).replace(/\.txt$/, "");
        const [hash, encPath, encRefWithSuffix = ""] = name.split(",");
        if (!hash || encPath === undefined) continue;
        const encRef = encRefWithSuffix.slice(0, Math.max(0, encRefWithSuffix.lastIndexOf("-")));
        views++;
        seen.add(hash);
        const path = decodeURIComponent(encPath);
        pages.set(path, (pages.get(path) ?? 0) + 1);
        const ref = decodeURIComponent(encRef);
        if (ref) refs.set(ref, (refs.get(ref) ?? 0) + 1);
      }
      if (!res.hasMore || !res.cursor) break;
      cursor = res.cursor;
    }
    byDay.push({ day, views, uniques: seen.size });
  }

  return NextResponse.json({
    total: byDay.reduce((n, d) => n + d.views, 0),
    days: byDay,
    pages: top(pages, 8),
    refs: top(refs, 8),
  });
}
