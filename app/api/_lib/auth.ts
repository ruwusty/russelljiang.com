import { createHash, timingSafeEqual } from "crypto";

// hash both sides so timingSafeEqual gets equal-length buffers
export function secretOk(provided: string | null, expected: string | undefined): boolean {
  if (!expected || !provided) return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export function passwordOk(provided: string | null): boolean {
  return secretOk(provided, process.env.SITE_PASSWORD);
}
