/**
 * app/api/leads/capture/route.ts
 * POST /api/leads/capture
 *
 * Captures a lead email for a given audit, then triggers the report email.
 *
 * Request body: { auditId: string; email: string; source?: string }
 * Response: { success: boolean; isDuplicate?: boolean } | { error: string }
 *
 * Rate limit: 3 submissions per IP per 15 minutes (spam prevention).
 * The stricter limit is intentional — email capture is a higher-value action.
 */
import { NextRequest, NextResponse } from "next/server";
import { captureLead, updateLeadEmailStatus } from "@/lib/db/leads";
import { getAdminClient } from "@/lib/supabase/admin";
import { sendAuditReportEmail } from "@/lib/email/resend";
import type { AuditRow } from "@/types/database";
import {
  getIpFromRequest,
  hashIp,
  checkLeadRateLimit,
} from "@/lib/utils/rate-limit";

// Basic email validation — good enough for server-side
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ─────────────────────────────────────────────────────
    const ip = getIpFromRequest(request);
    const ipHash = ip ? await hashIp(ip) : "unknown";
    const rateLimit = checkLeadRateLimit(ipHash);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
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

    // ── Parse + validate body ─────────────────────────────────────────────
    const body = await request.json();
    const { auditId, email, source } = body ?? {};

    if (!auditId || typeof auditId !== "string") {
      return NextResponse.json({ error: "Missing audit ID" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // ── Verify audit exists ───────────────────────────────────────────────
    const db = getAdminClient();
    const { data: auditRaw } = await db
      .from("audits")
      .select("id, share_slug, annual_savings, tool_count, health_score")
      .eq("id", auditId)
      .single();

    const audit = auditRaw as Pick<
      AuditRow,
      "id" | "share_slug" | "annual_savings" | "tool_count" | "health_score"
    > | null;

    if (!audit) {
      return NextResponse.json(
        { error: "Audit not found. Please run a new audit." },
        { status: 404 }
      );
    }

    // ── Save lead ─────────────────────────────────────────────────────────
    const { lead, error, isDuplicate } = await captureLead({
      auditId,
      email,
      ipAddress: ip,
      source: source ?? "share-modal",
    });

    if (isDuplicate) {
      // Still return success — don't leak that they already submitted
      return NextResponse.json({ success: true, isDuplicate: true });
    }

    if (error || !lead) {
      return NextResponse.json(
        { error: "Failed to save your email. Please try again." },
        { status: 500 }
      );
    }

    // ── Send email (non-blocking) ─────────────────────────────────────────
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const shareUrl = `${siteUrl}/r/${audit.share_slug}`;

    sendAuditReportEmail({
      to: email,
      shareUrl,
      annualSavings: audit.annual_savings,
      toolCount: audit.tool_count,
      healthScore: audit.health_score,
    })
      .then(({ messageId, error: emailError }) => {
        updateLeadEmailStatus(
          lead.id,
          messageId ? "sent" : "failed",
          messageId ?? undefined
        );
        if (emailError) console.warn("[leads/capture] Email not sent:", emailError);
      })
      .catch((err) => console.error("[leads/capture] Email error:", err));

    return NextResponse.json({ success: true, shareUrl });
  } catch (err) {
    console.error("[api/leads/capture] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
