/**
 * types/audit.ts
 * TypeScript interfaces for audit input data.
 *
 * These types describe what the user enters in the form.
 * They are intentionally separate from the pricing catalog types —
 * the catalog describes what's *available*, these describe what's *selected*.
 */
import type { UseCase, BillingCycle } from "@/config/pricing/types";

// ─── Single tool entry in the audit ──────────────────────────────────────────
export interface AuditToolEntry {
  /** ID of the selected AI tool from the catalog */
  toolId: string;
  /** ID of the selected plan for this tool */
  planId: string;
  /** Billing cycle (monthly / annual) */
  billingCycle: BillingCycle;
  /** Number of seats / licenses */
  seats: number;
  /** Actual monthly spend in USD (user-editable, especially for usage-based) */
  monthlySpend: number;
  /** Primary use case for this tool */
  useCase: UseCase;
  /** Optional notes */
  notes?: string;
}

// ─── Complete audit form submission ──────────────────────────────────────────
export interface AuditFormData {
  /** Company / team name (optional) */
  teamName: string;
  /** Total team size (for per-seat analysis) */
  teamSize: number;
  /** All selected tool entries */
  tools: AuditToolEntry[];
}

// ─── Form state management ──────────────────────────────────────────────────
export type AuditFormStep = "select-tools" | "configure" | "review";
