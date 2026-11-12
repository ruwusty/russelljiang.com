import { createHash, createHmac, timingSafeEqual } from "crypto";

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

// keyed, not a bare sha256: there are only ~4 billion ipv4 addresses, so an
// unkeyed hash of one can be reversed by trying them all. do NOT drop the key.
export function ipHash(req: Request, scope: string): string {
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  return createHmac("sha256", process.env.SITE_PASSWORD ?? "")
    .update(`${scope}:${ip}`)
    .digest("hex")
    .slice(0, 16);
}
