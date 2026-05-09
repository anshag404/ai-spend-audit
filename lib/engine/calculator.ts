/**
 * lib/engine/calculator.ts
 * Pure financial calculation functions.
 *
 * Every function is side-effect free and deterministic.
 * No access to external state, no AI, no network calls.
 *
 * Business logic rationale is documented inline — these decisions
 * are the core IP of the audit product.
 */
import type { AuditToolEntry } from "@/types/audit";
import type { SpendBreakdown, ToolAnalysis } from "./audit-types";
import { getToolById, CATEGORY_LABELS } from "@/config/pricing";
import type { ToolCategory } from "@/config/pricing/types";

// ─── Constants ──────────────────────────────────────────────────────────────
const MONTHS_PER_YEAR = 12;

// ─── Per-tool cost calculations ─────────────────────────────────────────────

/**
 * Calculate the effective monthly cost for a single tool entry.
 *
 * Business logic:
 * - For annual billing, we amortise over 12 months.
 * - If the user entered a custom spend (common for API/usage-based),
 *   we trust their number — they know their bill better than we do.
 * - For fixed plans, we cross-check seat × plan price vs entered spend
 *   and use the higher of the two (conservative assumption: user may
 *   have forgotten about taxes, add-ons, or overages).
 */
export function effectiveMonthly(entry: AuditToolEntry): number {
  const tool = getToolById(entry.toolId);
  if (!tool) return entry.monthlySpend;

  const plan = tool.plans.find((p) => p.id === entry.planId);
  if (!plan) return entry.monthlySpend;

  // Usage-based plans: trust the user's reported spend
  if (plan.usageBased) {
    return entry.monthlySpend;
  }

  // Fixed plans: compute expected cost
  const unitPrice =
    entry.billingCycle === "annual" && plan.priceAnnual !== null
      ? plan.priceAnnual / MONTHS_PER_YEAR
      : plan.priceMonthly;

  const computed = unitPrice * entry.seats;

  // Return the user's reported spend if it's higher (catches add-ons),
  // otherwise use computed (user may have forgotten or rounded down)
  return Math.max(computed, entry.monthlySpend);
}

/**
 * What would this tool cost on a different plan?
 * Returns monthly cost for the given plan ID and seat count.
 */
export function costOnPlan(
  toolId: string,
  planId: string,
  seats: number,
  billingCycle: "monthly" | "annual"
): number {
  const tool = getToolById(toolId);
  if (!tool) return 0;

  const plan = tool.plans.find((p) => p.id === planId);
  if (!plan) return 0;

  if (plan.usageBased) return plan.priceMonthly * seats;

  const unitPrice =
    billingCycle === "annual" && plan.priceAnnual !== null
      ? plan.priceAnnual / MONTHS_PER_YEAR
      : plan.priceMonthly;

  return unitPrice * seats;
}

/**
 * Calculate savings from switching billing cycle.
 * Returns positive number if annual is cheaper, 0 otherwise.
 */
export function annualSwitchSavings(entry: AuditToolEntry): number {
  const tool = getToolById(entry.toolId);
  if (!tool) return 0;

  const plan = tool.plans.find((p) => p.id === entry.planId);
  if (!plan || plan.priceAnnual === null || plan.usageBased) return 0;

  // Already on annual billing — no further savings
  if (entry.billingCycle === "annual") return 0;

  const monthlyTotal = plan.priceMonthly * entry.seats;
  const annualMonthlyEquiv = (plan.priceAnnual / MONTHS_PER_YEAR) * entry.seats;

  const savings = monthlyTotal - annualMonthlyEquiv;
  return savings > 0 ? round2(savings) : 0;
}

// ─── Aggregate calculations ─────────────────────────────────────────────────

/**
 * Build the complete spend breakdown from all tool entries.
 */
export function buildSpendBreakdown(
  entries: AuditToolEntry[],
  teamSize: number
): SpendBreakdown {
  let totalMonthly = 0;
  const byCategory: Record<string, number> = {};
  let topSpender = { toolId: "", toolName: "", monthlyCost: 0 };

  let totalSeats = 0;

  for (const entry of entries) {
    const cost = effectiveMonthly(entry);
    totalMonthly += cost;
    totalSeats += entry.seats;

    // Category aggregation
    const tool = getToolById(entry.toolId);
    const categoryKey = tool?.category ?? "unknown";
    const categoryLabel =
      CATEGORY_LABELS[categoryKey as ToolCategory] ?? categoryKey;
    byCategory[categoryLabel] = (byCategory[categoryLabel] ?? 0) + cost;

    // Track top spender
    if (cost > topSpender.monthlyCost) {
      topSpender = {
        toolId: entry.toolId,
        toolName: tool?.name ?? entry.toolId,
        monthlyCost: cost,
      };
    }
  }

  return {
    totalMonthly: round2(totalMonthly),
    totalAnnual: round2(totalMonthly * MONTHS_PER_YEAR),
    byCategory,
    topSpender,
    averageCostPerSeat: totalSeats > 0 ? round2(totalMonthly / totalSeats) : 0,
    costPerTeamMember: teamSize > 0 ? round2(totalMonthly / teamSize) : 0,
  };
}

/**
 * Build per-tool analysis summaries.
 */
export function buildToolAnalyses(
  entries: AuditToolEntry[],
  teamSize: number,
  totalMonthly: number
): ToolAnalysis[] {
  return entries.map((entry) => {
    const tool = getToolById(entry.toolId);
    const cost = effectiveMonthly(entry);

    return {
      toolId: entry.toolId,
      toolName: tool?.name ?? entry.toolId,
      monthlyCost: round2(cost),
      annualCost: round2(cost * MONTHS_PER_YEAR),
      costPerMember: teamSize > 0 ? round2(cost / teamSize) : 0,
      percentOfTotal: totalMonthly > 0 ? round2((cost / totalMonthly) * 100) : 0,
      recommendationIds: [], // filled in later by the engine
      status: "optimised" as const,
    };
  });
}

/**
 * Health score: 0–100.
 *
 * Scoring methodology (transparent, not a black box):
 * - Start at 100 (perfect)
 * - Deduct points based on savings percentage found
 * - Deduct for redundant tools in same category
 * - Deduct for billing-cycle inefficiency
 *
 * A score of 80+ is "good", 60–79 is "fair", below 60 is "needs attention".
 */
export function calculateHealthScore(
  savingsPercentage: number,
  redundantToolPairs: number,
  billingInefficiencies: number
): number {
  let score = 100;

  // The more potential savings, the worse the current state
  // Cap the deduction at 40 points (savings > 40% of total is extreme)
  score -= Math.min(savingsPercentage * 1.0, 40);

  // Redundant tools: -8 per pair (e.g. Cursor + Copilot for code gen)
  score -= redundantToolPairs * 8;

  // Billing inefficiency: -4 per tool that could save on annual billing
  score -= billingInefficiencies * 4;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Round to 2 decimal places. */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
