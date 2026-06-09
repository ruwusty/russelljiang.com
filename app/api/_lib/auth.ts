import { createHash, timingSafeEqual } from "crypto";

export function passwordOk(provided: string | null): boolean {
  const expected = process.env.SITE_PASSWORD;
  if (!expected || !provided) return false;
  // hash both sides so timingSafeEqual gets equal-length buffers
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
