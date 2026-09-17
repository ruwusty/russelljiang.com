import { put } from "@vercel/blob";
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { sydneyDateString } from "../../lib/digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// one empty blob per pageview; the data IS the pathname, so the owner view
// aggregates with a single list() per day and never fetches bodies.
// `,` is safe as a separator because encodeURIComponent always escapes it.
// ponytail: list-based counting — past ~10k hits/day move to a counter store.
const BOT = /bot|crawl|spider|slurp|preview|fetch|headless|lighthouse|monitor/i;
const MIN_GAP_MS = 2_000;
const recent = new Map<string, number>(); // per-instance, resets on cold start

function refHost(raw: unknown, selfHost: string | null): string {
  if (typeof raw !== "string" || !raw) return "";
  try {
    const host = new URL(raw).host.replace(/^www\./, "");
    return host === selfHost || host.endsWith(".vercel.app") ? "" : host.slice(0, 60);
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return new NextResponse(null, { status: 204 });

  let body: { p?: unknown; r?: unknown; s?: unknown };
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  const path = typeof body.p === "string" && body.p.startsWith("/") ? body.p.slice(0, 120) : null;
  if (!path) return new NextResponse(null, { status: 204 });

  const day = sydneyDateString();
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  // salted by the day: counts a visitor once per day and is unlinkable across days
  const hash = createHash("sha256").update(`hit:${day}:${ip}:${ua}`).digest("hex").slice(0, 10);

  const last = recent.get(hash) ?? 0;
  const now = Date.now();
  if (now - last < MIN_GAP_MS) return new NextResponse(null, { status: 204 });
  recent.set(hash, now);
  if (recent.size > 5_000) recent.clear();

  const ref = refHost(body.r, req.headers.get("host")?.replace(/^www\./, "") ?? null);
  const source =
    typeof body.s === "string" && /^[a-z0-9_-]{1,24}$/i.test(body.s) ? body.s.toLowerCase() : "";
  const name = `hits/${day}/${hash},${encodeURIComponent(path)},${encodeURIComponent(ref)},${source}.txt`;
  try {
    await put(name, "1", { access: "public", addRandomSuffix: true, contentType: "text/plain" });
  } catch (error: unknown) {
    console.error("hit blob write failed", error);
  }
  return new NextResponse(null, { status: 204 });
}
