/**
 * app/api/audit/save/route.ts
 * POST /api/audit/save
 *
 * Persists an audit report to Supabase and returns a share slug.
 * Called from the client right after the audit engine runs.
 *
 * Request body: { report: AuditReport }
 * Response: { slug: string; shareUrl: string } | { error: string }
 *
 * Rate limit: 10 saves per IP per hour.
 */
import { NextRequest, NextResponse } from "next/server";
import type { AuditReport } from "@/lib/engine/audit-types";
import { saveAudit } from "@/lib/db/audits";
import {
  getIpFromRequest,
  hashIp,
  checkAuditRateLimit,
} from "@/lib/utils/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ─────────────────────────────────────────────────────
    const ip = getIpFromRequest(request);
    const ipHash = ip ? await hashIp(ip) : "unknown";
    const rateLimit = checkAuditRateLimit(ipHash);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many audits. Please wait before running another." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    // ── Parse body ────────────────────────────────────────────────────────
    const body = await request.json();
    const report = body?.report as AuditReport | undefined;

    if (!report || !report.spend || !report.recommendations) {
      return NextResponse.json(
        { error: "Invalid audit report data" },
        { status: 400 }
      );
    }

    // ── Save to database ──────────────────────────────────────────────────
    const { slug, auditId, error } = await saveAudit({
      report,
      ipAddress: ip,
    });

    if (error || !slug) {
      // DB errors should not block the user — they can still see local results
      console.error("[api/audit/save] Save failed:", error);
      return NextResponse.json(
        { error: "Failed to save audit. Please try again." },
        { status: 500 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const shareUrl = `${siteUrl}/r/${slug}`;

    return NextResponse.json({ slug, shareUrl, auditId });
  } catch (err) {
    console.error("[api/audit/save] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
