import { NextResponse } from "next/server";
import { digestErrorMessage, runDigest, sydneyDateString } from "../../../../lib/digest";
import { writeDigest } from "../../../../lib/digest-store";
import { passwordOk } from "../../../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// manual run. accepts either the trigger secret (for curl) or the site
// password (for the owner-only [refresh] button, which reuses the login
// session — so no digest secret ever reaches the browser).
export async function POST(req: Request) {
  const secret = process.env.DIGEST_TRIGGER_SECRET;
  const okSecret = Boolean(secret) && req.headers.get("x-trigger-secret") === secret;
  const okPassword = passwordOk(req.headers.get("x-site-password"));
  if (!okSecret && !okPassword) {
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
    const detail = digestErrorMessage(error);
    console.error("[digest] manual run failed:", detail);
    return NextResponse.json({ error: "digest generation failed", detail }, { status: 500 });
  }
}
