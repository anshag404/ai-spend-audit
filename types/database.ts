/**
 * types/database.ts
 * Supabase database type definitions for the AI Spend Audit schema.
 *
 * Schema design decisions:
 * - audits: stores the sanitized public report data. PII-free by design.
 *   The `public_snapshot` column holds only anonymized financial metrics
 *   safe to expose on public share pages.
 * - leads: stores emails SEPARATELY from audit data. This means:
 *   (a) We can delete leads without losing audit analytics.
 *   (b) A compromised audit row never exposes email addresses.
 *   (c) We comply with GDPR right-to-erasure by deleting leads rows only.
 * - share_slug: 12-char nanoid (non-sequential, hard to enumerate).
 *   NOT the UUID — gives us clean URLs like /r/abc123xyz456.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      audits: {
        Row: {
          /** Internal UUID primary key */
          id: string;
          /** 12-char nanoid used in public share URLs (/r/[share_slug]) */
          share_slug: string;
          /** ISO timestamp of when the audit was run */
          created_at: string;
          /** IP address (hashed) for rate-limiting — never stored in plain text */
          ip_hash: string | null;
          /** Total monthly spend in USD */
          total_monthly_spend: number;
          /** Total annual spend in USD */
          total_annual_spend: number;
          /** Potential annual savings in USD */
          annual_savings: number;
          /** Potential monthly savings in USD */
          monthly_savings: number;
          /** Savings as % of total spend */
          savings_percentage: number;
          /** Health score 0–100 */
          health_score: number;
          /** Number of tools audited */
          tool_count: number;
          /** Team size (number of people, not seats) */
          team_size: number;
          /** Number of actionable recommendations */
          actionable_count: number;
          /** Number of high-confidence recommendations */
          high_confidence_count: number;
          /**
           * Full sanitized public snapshot as JSON.
           * Contains: recommendations (titles + savings only), tool names,
           * spend breakdown percentages. NEVER contains email or company name.
           */
          public_snapshot: Json;
          /** Whether this audit has been claimed by a lead (email captured) */
          has_lead: boolean;
          /** View count for the public share page */
          view_count: number;
        };
        Insert: Omit<
          Database["public"]["Tables"]["audits"]["Row"],
          "id" | "created_at" | "view_count" | "has_lead"
        >;
        Update: Partial<Database["public"]["Tables"]["audits"]["Row"]>;
      };

      leads: {
        Row: {
          /** Internal UUID primary key */
          id: string;
          /** FK to audits.id — links lead to their audit */
          audit_id: string;
          /** ISO timestamp of when the lead was captured */
          created_at: string;
          /** Lead's email address (the only PII we store) */
          email: string;
          /** Optional company name */
          company_name: string | null;
          /** Optional job title/role */
          role: string | null;
          /** Optional team size range */
          team_size: number | null;
          /** Email delivery status from Resend */
          email_status: "pending" | "sent" | "failed";
          /** Resend message ID for delivery tracking */
          resend_message_id: string | null;
          /** Source of the lead (e.g. "share-modal", "results-page") */
          source: string;
          /** IP address (hashed) for abuse prevention */
          ip_hash: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["leads"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["leads"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_view_count: {
        Args: { slug: string };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
  };
}

// ─── Convenience row types ───────────────────────────────────────────────────
export type AuditRow = Database["public"]["Tables"]["audits"]["Row"];
export type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

// ─── Public snapshot shape (what lives in audits.public_snapshot) ────────────
// This is the ONLY data shown on the public /r/[slug] page.
// No emails, no company names, no team names.
export interface PublicAuditSnapshot {
  /** Total monthly spend — shown as-is */
  totalMonthly: number;
  /** Total annual spend */
  totalAnnual: number;
  /** Annual savings */
  annualSavings: number;
  /** Monthly savings */
  monthlySavings: number;
  /** Savings % */
  savingsPercentage: number;
  /** Health score */
  healthScore: number;
  /** Number of tools (not the names) */
  toolCount: number;
  /** Number of people on team */
  teamSize: number;
  /** Actionable recommendation count */
  actionableCount: number;
  /** Recommendations — titles and savings only, no tool-specific details */
  recommendations: Array<{
    title: string;
    annualSavings: number;
    confidence: "high" | "medium" | "low";
  }>;
  /** Per-tool breakdown (tool name + % of total only) */
  toolBreakdown: Array<{
    toolName: string;
    percentOfTotal: number;
    monthlyCost: number;
  }>;
}
