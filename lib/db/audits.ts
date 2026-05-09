/**
 * lib/db/audits.ts
 * Database helper functions for the audits table.
 *
 * Note on type casting:
 * Supabase's generated client can't infer column types from our custom
 * Database interface. We use explicit `as` casts — this is safe because
 * the SQL schema enforces the runtime types.
 */
import { customAlphabet } from "nanoid";
import { getAdminClient } from "@/lib/supabase/admin";
import type { AuditReport } from "@/lib/engine/audit-types";
import type { AuditRow, PublicAuditSnapshot } from "@/types/database";
import { hashIp } from "@/lib/utils/rate-limit";

const generateSlug = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  12
);

/** Strip PII from the full audit report — only safe metrics reach public pages. */
export function buildPublicSnapshot(report: AuditReport): PublicAuditSnapshot {
  return {
    totalMonthly: report.spend.totalMonthly,
    totalAnnual: report.spend.totalAnnual,
    annualSavings: report.summary.totalAnnualSavings,
    monthlySavings: report.summary.totalMonthlySavings,
    savingsPercentage: report.summary.savingsPercentage,
    healthScore: report.summary.healthScore,
    toolCount: report.toolCount,
    teamSize: report.teamSize,
    actionableCount: report.summary.actionableCount,
    recommendations: report.recommendations.slice(0, 5).map((r) => ({
      title: r.title,
      annualSavings: r.annualSavings,
      confidence: r.confidence,
    })),
    toolBreakdown: report.tools.map((t) => ({
      toolName: t.toolName,
      percentOfTotal: t.percentOfTotal,
      monthlyCost: t.monthlyCost,
    })),
  };
}

export interface SaveAuditOptions {
  report: AuditReport;
  ipAddress: string | null;
}

export interface SaveAuditResult {
  slug: string;
  auditId: string;
  error?: string;
}

export async function saveAudit({
  report,
  ipAddress,
}: SaveAuditOptions): Promise<SaveAuditResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getAdminClient() as any;
  const slug = generateSlug();
  const ipHash = ipAddress ? await hashIp(ipAddress) : null;
  const snapshot = buildPublicSnapshot(report);

  const { data, error } = await db
    .from("audits")
    .insert({
      share_slug: slug,
      ip_hash: ipHash,
      total_monthly_spend: report.spend.totalMonthly,
      total_annual_spend: report.spend.totalAnnual,
      annual_savings: report.summary.totalAnnualSavings,
      monthly_savings: report.summary.totalMonthlySavings,
      savings_percentage: report.summary.savingsPercentage,
      health_score: report.summary.healthScore,
      tool_count: report.toolCount,
      team_size: report.teamSize,
      actionable_count: report.summary.actionableCount,
      high_confidence_count: report.summary.highConfidenceCount,
      public_snapshot: snapshot,
    })
    .select("id, share_slug")
    .single();

  if (error || !data) {
    console.error("[saveAudit] DB error:", error);
    return { slug: "", auditId: "", error: error?.message ?? "Unknown error" };
  }

  const row = data as Pick<AuditRow, "id" | "share_slug">;
  return { slug: row.share_slug, auditId: row.id };
}

export async function getPublicAudit(slug: string): Promise<{
  audit: AuditRow | null;
  snapshot: PublicAuditSnapshot | null;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getAdminClient() as any;

  const { data, error } = await db
    .from("audits")
    .select("*")
    .eq("share_slug", slug)
    .single();

  if (error || !data) {
    return { audit: null, snapshot: null };
  }

  // Increment view count fire-and-forget
  db.rpc("increment_view_count", { slug }).then(() => {});

  const audit = data as AuditRow;
  const snapshot = audit.public_snapshot as unknown as PublicAuditSnapshot;
  return { audit, snapshot };
}

export async function markAuditHasLead(auditId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getAdminClient() as any;
  await db.from("audits").update({ has_lead: true }).eq("id", auditId);
}
