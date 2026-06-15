import { NextResponse } from "next/server";
import { digestErrorMessage, runDigest, sydneyDateString } from "../../../lib/digest";
import { writeDigest } from "../../../lib/digest-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// vercel sends `Authorization: Bearer <CRON_SECRET>` to scheduled routes.
// require it when set so nobody can trigger the (paid) job by hitting the url.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  if (!secret) {
    console.warn("digest cron: CRON_SECRET is not set — endpoint is unprotected");
  }

  try {
    const digest = await runDigest();
    await writeDigest(digest, sydneyDateString());
    return NextResponse.json({ ok: true, items: digest.itemCount, sources: digest.sourceCount });
  } catch (error: unknown) {
    const detail = digestErrorMessage(error);
    console.error("[digest] cron failed:", detail);
    return NextResponse.json({ error: "digest generation failed", detail }, { status: 500 });
  }
}
