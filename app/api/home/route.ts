import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { passwordOk } from "../_lib/auth";
import { isValidHomeContent } from "../../lib/home-content";
import { HOME_BLOB_PATH, readHomeContent } from "../../lib/home-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const content = await readHomeContent();
  return NextResponse.json({ content });
}

export async function PUT(req: Request) {
  if (!passwordOk(req.headers.get("x-site-password"))) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!isValidHomeContent(body)) {
    return NextResponse.json({ error: "invalid home content" }, { status: 400 });
  }

  try {
    await put(HOME_BLOB_PATH, JSON.stringify(body), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("home blob write failed", error);
    return NextResponse.json({ error: "storage unavailable" }, { status: 503 });
  }
}
