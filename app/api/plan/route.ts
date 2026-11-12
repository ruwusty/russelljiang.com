import { NextResponse } from "next/server";
import { readJson, writeJson } from "../../lib/blob-json";
import { passwordOk } from "../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BLOB_PATH = "plan/courses.json";
const MAX_COURSES = 200;
const COURSE_TYPES = ["core", "prescribed", "free", "gened"] as const;

type CourseType = (typeof COURSE_TYPES)[number];

interface Course {
  id: number;
  term: string;
  code: string;
  name: string;
  type: CourseType;
}

function isValidCourse(value: unknown): value is Course {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "number" &&
    Number.isFinite(o.id) &&
    typeof o.term === "string" &&
    o.term.length <= 20 &&
    typeof o.code === "string" &&
    o.code.length <= 20 &&
    typeof o.name === "string" &&
    o.name.length <= 120 &&
    typeof o.type === "string" &&
    (COURSE_TYPES as readonly string[]).includes(o.type)
  );
}

export async function GET() {
  try {
    const courses = await readJson(BLOB_PATH);
    if (!Array.isArray(courses) || !courses.every(isValidCourse)) {
      throw new Error("stored plan is malformed");
    }
    return NextResponse.json({ courses });
  } catch {
    // nothing stored yet (first run) or blob not configured — client uses defaults
    return NextResponse.json({ courses: null });
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

  if (
    !Array.isArray(body) ||
    body.length > MAX_COURSES ||
    !body.every(isValidCourse)
  ) {
    return NextResponse.json({ error: "invalid plan data" }, { status: 400 });
  }

  try {
    await writeJson(BLOB_PATH, body);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("plan blob write failed", error);
    return NextResponse.json({ error: "storage unavailable" }, { status: 503 });
  }
}
