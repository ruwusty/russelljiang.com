import { head, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { passwordOk } from "../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BLOB_PATH = "presets/presets.json";
const MAX_PRESETS = 20;
const MAX_BLOCKS = 12;
const MAX_DIALS = 12;

function isShortString(v: unknown, max: number): v is string {
  return typeof v === "string" && v.length <= max;
}

function isValidDial(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return isShortString(o.label, 24) && isShortString(o.value, 24);
}

function isValidBlock(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (!isShortString(o.label, 24)) return false;
  if (o.name !== undefined && !isShortString(o.name, 40)) return false;
  if (o.pickup !== undefined && !isShortString(o.pickup, 24)) return false;
  if (o.off !== undefined && typeof o.off !== "boolean") return false;
  if (o.dials !== undefined) {
    if (!Array.isArray(o.dials) || o.dials.length > MAX_DIALS) return false;
    if (!o.dials.every(isValidDial)) return false;
  }
  return true;
}

function isValidPreset(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    isShortString(o.num, 4) &&
    isShortString(o.name, 40) &&
    isShortString(o.desc, 60) &&
    Array.isArray(o.chain) &&
    o.chain.length <= MAX_BLOCKS &&
    o.chain.every(isValidBlock)
  );
}

function isValidPresets(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length <= MAX_PRESETS &&
    value.every(isValidPreset)
  );
}

export async function GET() {
  try {
    const meta = await head(BLOB_PATH);
    const res = await fetch(`${meta.url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`blob fetch failed: ${res.status}`);
    const presets: unknown = await res.json();
    if (!isValidPresets(presets)) throw new Error("stored presets are malformed");
    return NextResponse.json({ presets });
  } catch {
    // nothing stored yet or blob not configured — client uses defaults
    return NextResponse.json({ presets: null });
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

  if (!isValidPresets(body)) {
    return NextResponse.json({ error: "invalid preset data" }, { status: 400 });
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
    console.error("presets blob write failed", error);
    return NextResponse.json({ error: "storage unavailable" }, { status: 503 });
  }
}
