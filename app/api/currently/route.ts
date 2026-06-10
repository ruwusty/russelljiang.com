import { head, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { passwordOk } from "../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BLOB_PATH = "currently/items.json";
const MAX_ITEMS = 200;
const ITEM_MAX_LENGTH = 100;

function isValidItems(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= MAX_ITEMS &&
    value.every(
      (item) =>
        typeof item === "string" &&
        item.trim().length > 0 &&
        item.length <= ITEM_MAX_LENGTH
    )
  );
}

export async function GET() {
  try {
    const meta = await head(BLOB_PATH);
    const res = await fetch(`${meta.url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`blob fetch failed: ${res.status}`);
    const items: unknown = await res.json();
    if (!isValidItems(items)) throw new Error("stored items are malformed");
    return NextResponse.json({ items });
  } catch {
    // nothing stored yet or blob not configured — client uses defaults
    return NextResponse.json({ items: null });
  }
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

  if (!isValidItems(body)) {
    return NextResponse.json(
      { error: `invalid items — need 1-${MAX_ITEMS} non-empty lines, ${ITEM_MAX_LENGTH} chars max` },
      { status: 400 }
    );
  }

  try {
    await put(BLOB_PATH, JSON.stringify(body), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("currently blob write failed", error);
    return NextResponse.json({ error: "storage unavailable" }, { status: 503 });
  }
}
