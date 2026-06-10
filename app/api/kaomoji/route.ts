import { head, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { passwordOk } from "../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BLOB_PATH = "kaomoji/slots.json";
const MAX_SLOTS = 20;
const SLOT_RE = /^[a-z][a-z0-9-]{0,23}$/;
const VALUE_MAX = 40;

function isValidSlots(value: unknown): value is Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return (
    entries.length <= MAX_SLOTS &&
    entries.every(
      ([key, val]) =>
        SLOT_RE.test(key) && typeof val === "string" && val.length <= VALUE_MAX
    )
  );
}

async function readSlots(): Promise<Record<string, string>> {
  try {
    const meta = await head(BLOB_PATH);
    const res = await fetch(`${meta.url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`blob fetch failed: ${res.status}`);
    const data: unknown = await res.json();
    return isValidSlots(data) ? data : {};
  } catch {
    return {};
  }
}

export async function GET() {
  const slots = await readSlots();
  return NextResponse.json({ slots });
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

  const o = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const slot = typeof o.slot === "string" ? o.slot : "";
  const value = typeof o.value === "string" ? o.value.slice(0, VALUE_MAX) : null;

  if (!SLOT_RE.test(slot) || value === null) {
    return NextResponse.json({ error: "invalid slot or value" }, { status: 400 });
  }

  const current = await readSlots();
  const merged = { ...current, [slot]: value };
  if (!isValidSlots(merged)) {
    return NextResponse.json({ error: "too many slots" }, { status: 400 });
  }

  try {
    await put(BLOB_PATH, JSON.stringify(merged), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return NextResponse.json({ slots: merged });
  } catch (error: unknown) {
    console.error("kaomoji blob write failed", error);
    return NextResponse.json({ error: "storage unavailable" }, { status: 503 });
  }
}
