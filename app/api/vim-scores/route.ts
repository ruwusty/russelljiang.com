import { head, put } from "@vercel/blob";
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { passwordOk } from "../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BLOB_PATH = "vim/leaderboard.json";
const NAME_MAX = 24;
const STORED_PER_BOARD = 50;
const SHOWN_PER_BOARD = 10;
const COOLDOWN_MS = 30_000;

const DIFFICULTIES = ["easy", "normal", "hard"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

// fewest possible keystrokes is one per target
const MIN_KEYS: Record<Difficulty, number> = { easy: 5, normal: 10, hard: 15 };

interface StoredEntry {
  id: string;
  name: string;
  time: number;
  keys: number;
  ts: string;
  iphash: string;
}

type Boards = Record<Difficulty, StoredEntry[]>;

type PublicEntry = Omit<StoredEntry, "iphash">;

const EMPTY_BOARDS: Boards = { easy: [], normal: [], hard: [] };

function toPublic(entry: StoredEntry): PublicEntry {
  const { iphash: _iphash, ...rest } = entry;
  return rest;
}

function publicBoards(boards: Boards): Record<Difficulty, PublicEntry[]> {
  return {
    easy: boards.easy.slice(0, SHOWN_PER_BOARD).map(toPublic),
    normal: boards.normal.slice(0, SHOWN_PER_BOARD).map(toPublic),
    hard: boards.hard.slice(0, SHOWN_PER_BOARD).map(toPublic),
  };
}

function isStoredEntry(value: unknown): value is StoredEntry {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.time === "number" &&
    typeof o.keys === "number" &&
    typeof o.ts === "string" &&
    typeof o.iphash === "string"
  );
}

async function readBoards(): Promise<Boards> {
  try {
    const meta = await head(BLOB_PATH);
    const res = await fetch(`${meta.url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`blob fetch failed: ${res.status}`);
    const data: unknown = await res.json();
    if (typeof data !== "object" || data === null) return { ...EMPTY_BOARDS };
    const o = data as Record<string, unknown>;
    const boards: Boards = { ...EMPTY_BOARDS };
    for (const d of DIFFICULTIES) {
      boards[d] = Array.isArray(o[d]) ? (o[d] as unknown[]).filter(isStoredEntry) : [];
    }
    return boards;
  } catch {
    return { ...EMPTY_BOARDS };
  }
}

async function writeBoards(boards: Boards): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(boards), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function ipHash(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for") ?? "local";
  const ip = forwarded.split(",")[0].trim();
  return createHash("sha256").update(`vim:${ip}`).digest("hex").slice(0, 16);
}

export async function GET() {
  const boards = await readBoards();
  return NextResponse.json({ boards: publicBoards(boards) });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const o = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;

  // honeypot
  if (typeof o.website === "string" && o.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const difficulty = DIFFICULTIES.includes(o.difficulty as Difficulty)
    ? (o.difficulty as Difficulty)
    : null;
  const time = typeof o.time === "number" && Number.isFinite(o.time) ? o.time : null;
  const keys = typeof o.keys === "number" && Number.isInteger(o.keys) ? o.keys : null;
  const name =
    typeof o.name === "string"
      ? o.name.replace(/\s+/g, " ").trim().slice(0, NAME_MAX) || "anon"
      : "anon";

  if (
    !difficulty ||
    time === null ||
    keys === null ||
    time < 0.5 ||
    time > 3600 ||
    keys < MIN_KEYS[difficulty] ||
    keys > 5000
  ) {
    return NextResponse.json({ error: "invalid score" }, { status: 400 });
  }

  const hash = ipHash(req);
  const boards = await readBoards();

  const lastFromIp = [...boards[difficulty]]
    .filter((e) => e.iphash === hash)
    .sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts))[0];
  if (lastFromIp && Date.now() - Date.parse(lastFromIp.ts) < COOLDOWN_MS) {
    return NextResponse.json({ error: "slow down — one submission per 30s" }, { status: 429 });
  }

  const entry: StoredEntry = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    name,
    time: Math.round(time * 10) / 10,
    keys,
    ts: new Date().toISOString(),
    iphash: hash,
  };

  const updated: Boards = {
    ...boards,
    [difficulty]: [...boards[difficulty], entry]
      .sort((a, b) => a.time - b.time || a.keys - b.keys)
      .slice(0, STORED_PER_BOARD),
  };

  try {
    await writeBoards(updated);
    return NextResponse.json({ boards: publicBoards(updated), id: entry.id });
  } catch (error: unknown) {
    console.error("vim leaderboard write failed", error);
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
  const o = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const difficulty = DIFFICULTIES.includes(o.difficulty as Difficulty)
    ? (o.difficulty as Difficulty)
    : null;
  const id = typeof o.id === "string" ? o.id : null;
  if (!difficulty || !id) {
    return NextResponse.json({ error: "difficulty and id required" }, { status: 400 });
  }
  const boards = await readBoards();
  const updated: Boards = {
    ...boards,
    [difficulty]: boards[difficulty].filter((e) => e.id !== id),
  };
  try {
    await writeBoards(updated);
    return NextResponse.json({ boards: publicBoards(updated) });
  } catch (error: unknown) {
    console.error("vim leaderboard write failed", error);
    return NextResponse.json({ error: "storage unavailable" }, { status: 503 });
  }
}
