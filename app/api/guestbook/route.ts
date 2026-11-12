import { NextResponse } from "next/server";
import { readJson, writeJson } from "../../lib/blob-json";
import { ipHash, passwordOk } from "../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BLOB_PATH = "guestbook/entries.json";
const MAX_ENTRIES = 500;
const NAME_MAX = 24;
const MESSAGE_MAX = 140;
const COOLDOWN_MS = 60_000;

interface StoredEntry {
  id: string;
  name: string;
  message: string;
  ts: string;
  iphash: string;
}

type PublicEntry = Omit<StoredEntry, "iphash">;

function toPublic(entry: StoredEntry): PublicEntry {
  return { id: entry.id, name: entry.name, message: entry.message, ts: entry.ts };
}

function clean(value: string, max: number): string {
  // replace control characters with spaces, collapse whitespace, cap length
  let stripped = "";
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    stripped += code < 32 || code === 127 ? " " : ch;
  }
  return stripped.replace(/\s+/g, " ").trim().slice(0, max);
}

function isStoredEntry(value: unknown): value is StoredEntry {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.message === "string" &&
    typeof o.ts === "string" &&
    typeof o.iphash === "string"
  );
}

async function readEntries(): Promise<StoredEntry[]> {
  try {
    const data = await readJson(BLOB_PATH);
    if (!Array.isArray(data)) return [];
    return data.filter(isStoredEntry);
  } catch {
    return [];
  }
}

async function writeEntries(entries: StoredEntry[]): Promise<void> {
  await writeJson(BLOB_PATH, entries);
}

// the hash only exists to enforce the cooldown, so drop it once it can't
const forget = (e: StoredEntry): StoredEntry =>
  e.iphash && Date.now() - Date.parse(e.ts) >= COOLDOWN_MS ? { ...e, iphash: "" } : e;

export async function GET() {
  const entries = await readEntries();
  return NextResponse.json({ entries: entries.map(toPublic) });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const o = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;

  // honeypot: real users never fill this; pretend success for bots
  if (typeof o.website === "string" && o.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const message = typeof o.message === "string" ? clean(o.message, MESSAGE_MAX) : "";
  const name = typeof o.name === "string" ? clean(o.name, NAME_MAX) || "anon" : "anon";

  if (!message) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  const hash = ipHash(req, "guestbook");
  const entries = await readEntries();

  const lastFromIp = [...entries].reverse().find((e) => e.iphash === hash);
  if (lastFromIp && Date.now() - Date.parse(lastFromIp.ts) < COOLDOWN_MS) {
    return NextResponse.json({ error: "slow down — one entry a minute" }, { status: 429 });
  }

  const entry: StoredEntry = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    name,
    message,
    ts: new Date().toISOString(),
    iphash: hash,
  };

  try {
    await writeEntries([...entries.map(forget), entry].slice(-MAX_ENTRIES));
    return NextResponse.json({ entry: toPublic(entry) });
  } catch (error: unknown) {
    console.error("guestbook blob write failed", error);
    return NextResponse.json({ error: "storage unavailable" }, { status: 503 });
  }
}

export async function DELETE(req: Request) {
  if (!passwordOk(req.headers.get("x-site-password"))) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const id = typeof (body as { id?: unknown })?.id === "string" ? (body as { id: string }).id : null;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const entries = await readEntries();
  try {
    await writeEntries(entries.filter((e) => e.id !== id));
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("guestbook blob write failed", error);
    return NextResponse.json({ error: "storage unavailable" }, { status: 503 });
  }
}
