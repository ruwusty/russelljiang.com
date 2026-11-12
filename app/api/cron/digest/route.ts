import { NextResponse } from "next/server";
import { digestErrorMessage, runDigest, sydneyDateString } from "../../../lib/digest";
import { writeDigest } from "../../../lib/digest-store";
import { secretOk } from "../../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// vercel sends `Authorization: Bearer <CRON_SECRET>` to scheduled routes.
// fail closed: with no secret configured nobody can run the job, vercel included.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) console.error("digest cron: CRON_SECRET is not set, refusing to run");
  if (!secret || !secretOk(req.headers.get("authorization"), `Bearer ${secret}`)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
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
