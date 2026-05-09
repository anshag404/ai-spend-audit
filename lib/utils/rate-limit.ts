/**
 * lib/utils/rate-limit.ts
 * In-process rate limiting + IP hashing utilities.
 *
 * Strategy:
 * - Use an in-memory Map as a sliding window counter per IP hash.
 * - This is "good enough" for a single-instance Next.js deployment.
 * - For multi-instance / edge deployments, swap the Map for Upstash Redis.
 *
 * Limits:
 * - Save audit: 10 per IP per hour
 * - Capture lead: 3 per IP per 15 minutes (stricter, prevents spam)
 *
 * IP hashing:
 * - We NEVER store plain IP addresses.
 * - SHA-256 hash of `IP + daily salt` (salt rotates daily so hashes expire).
 * - This makes hashes non-reversible and auto-invalidating.
 */
import { createHash } from "crypto";

// ─── Config ───────────────────────────────────────────────────────────────────
const AUDIT_LIMIT = 10;        // max audits per IP per window
const AUDIT_WINDOW_MS = 60 * 60 * 1000;  // 1 hour

const LEAD_LIMIT = 3;          // max lead captures per IP per window
const LEAD_WINDOW_MS = 15 * 60 * 1000;   // 15 minutes

// ─── In-memory store ──────────────────────────────────────────────────────────
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const auditStore = new Map<string, RateLimitEntry>();
const leadStore = new Map<string, RateLimitEntry>();

function checkLimit(
  store: Map<string, RateLimitEntry>,
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

// Clean up expired entries periodically (every 5 minutes in production)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of auditStore) {
      if (now > entry.resetAt) auditStore.delete(key);
    }
    for (const [key, entry] of leadStore) {
      if (now > entry.resetAt) leadStore.delete(key);
    }
  }, 5 * 60 * 1000);
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function checkAuditRateLimit(ipHash: string) {
  return checkLimit(auditStore, ipHash, AUDIT_LIMIT, AUDIT_WINDOW_MS);
}

export function checkLeadRateLimit(ipHash: string) {
  return checkLimit(leadStore, ipHash, LEAD_LIMIT, LEAD_WINDOW_MS);
}

// ─── IP hashing ───────────────────────────────────────────────────────────────
/**
 * Hash an IP address with a daily salt.
 * The salt rotates at midnight UTC, so hashes auto-expire each day.
 * This means stored hashes cannot be used to track users across days.
 */
export async function hashIp(ip: string): Promise<string> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const salt = process.env.IP_HASH_SALT ?? "ai-spend-audit-default-salt";
  return createHash("sha256")
    .update(`${ip}:${today}:${salt}`)
    .digest("hex")
    .slice(0, 16); // 16 hex chars is enough for rate-limit keys
}

// ─── Extract IP from Next.js request ─────────────────────────────────────────
export function getIpFromRequest(request: Request): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null
  );
}
