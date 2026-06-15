import { NextResponse } from "next/server";
import { runDigest, sydneyDateString } from "../../../../lib/digest";
import { writeDigest } from "../../../../lib/digest-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// manual run: POST with header `x-trigger-secret: <DIGEST_TRIGGER_SECRET>`.
// lets you populate / refresh the digest on demand without waiting for cron.
export async function POST(req: Request) {
  const secret = process.env.DIGEST_TRIGGER_SECRET;
  if (!secret || req.headers.get("x-trigger-secret") !== secret) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  try {
    const digest = await runDigest();
    await writeDigest(digest, sydneyDateString());
    return NextResponse.json({
      ok: true,
      items: digest.itemCount,
      sources: digest.sourceCount,
      generatedAt: digest.generatedAt,
    });
  } catch (error: unknown) {
    console.error("manual digest failed:", error);
    return NextResponse.json({ error: "digest generation failed" }, { status: 500 });
  }
}
