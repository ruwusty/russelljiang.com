import { head, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { passwordOk } from "../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BLOB_PATH = "library/books.json";
const MAX_BOOKS = 100;

const STATUSES = ["reading", "to-read", "read"] as const;

function isShortString(v: unknown, max: number, allowEmpty = false): v is string {
  return typeof v === "string" && v.length <= max && (allowEmpty || v.trim().length > 0);
}

function isValidBook(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (!isShortString(o.id, 24)) return false;
  if (!isShortString(o.title, 100)) return false;
  if (!isShortString(o.author, 60)) return false;
  if (typeof o.status !== "string" || !(STATUSES as readonly string[]).includes(o.status)) return false;
  if (o.tag !== undefined && !isShortString(o.tag, 20, true)) return false;
  if (o.note !== undefined && !isShortString(o.note, 200, true)) return false;
  return true;
}

function isValidBooks(value: unknown): boolean {
  return Array.isArray(value) && value.length <= MAX_BOOKS && value.every(isValidBook);
}

export async function GET() {
  try {
    const meta = await head(BLOB_PATH);
    const res = await fetch(`${meta.url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`blob fetch failed: ${res.status}`);
    const books: unknown = await res.json();
    if (!isValidBooks(books)) throw new Error("stored library is malformed");
    return NextResponse.json({ books });
  } catch {
    // nothing stored yet or blob not configured — client uses defaults
    return NextResponse.json({ books: null });
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

  if (!isValidBooks(body)) {
    return NextResponse.json({ error: "invalid library data" }, { status: 400 });
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
    console.error("library blob write failed", error);
    return NextResponse.json({ error: "storage unavailable" }, { status: 503 });
  }
}
