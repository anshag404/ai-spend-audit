/**
 * lib/engine/recommendation-engine.ts
 * The main audit engine orchestrator.
 *
 * Takes validated form data → runs all rules → deduplicates →
 * builds the final AuditReport. This is the only public entry point
 * for the audit engine.
 *
 * No AI. No network calls. No side effects.
 * Runs entirely in the browser (client-side).
 */
import type { AuditFormData } from "@/types/audit";
import type { AuditReport, Recommendation } from "./audit-types";
import {
  effectiveMonthly,
  buildSpendBreakdown,
  buildToolAnalyses,
  calculateHealthScore,
  round2,
} from "./calculator";
import { ALL_RULES, resetRuleCounter } from "./rules";
import type { RuleContext } from "./rules";

// ─── Main entry point ───────────────────────────────────────────────────────

/**
 * Run the full audit engine on validated form data.
 *
 * @param data - Validated AuditFormData from the form
 * @returns Complete AuditReport with recommendations
 *
 * @example
 * ```ts
 * const report = runAudit(formData);
 * console.log(report.summary.totalAnnualSavings);
 * ```
 */
export function runAudit(data: AuditFormData): AuditReport {
  // Reset the rule counter for deterministic IDs
  resetRuleCounter();

  // ── Step 1: Calculate totals ────────────────────────────────────────────
  const totalMonthly = data.tools.reduce(
    (sum, entry) => sum + effectiveMonthly(entry),
    0
  );

  // ── Step 2: Build rule context ──────────────────────────────────────────
  const ctx: RuleContext = {
    entries: data.tools,
    teamSize: data.teamSize,
    teamName: data.teamName,
    totalMonthly,
  };

  // ── Step 3: Run all rules ───────────────────────────────────────────────
  const rawRecommendations: Recommendation[] = [];
  for (const rule of ALL_RULES) {
    try {
      const recs = rule(ctx);
      rawRecommendations.push(...recs);
    } catch (error) {
      // Defensive: a single rule failing should never crash the engine
      console.warn("[audit-engine] Rule failed:", error);
    }
  }

  // ── Step 4: Deduplicate and filter ──────────────────────────────────────
  const recommendations = deduplicateRecommendations(rawRecommendations);

  // ── Step 5: Sort by savings (highest first) ─────────────────────────────
  recommendations.sort((a, b) => b.monthlySavings - a.monthlySavings);

  // ── Step 6: Build spend breakdown ───────────────────────────────────────
  const spend = buildSpendBreakdown(data.tools, data.teamSize);

  // ── Step 7: Build per-tool analyses ─────────────────────────────────────
  const tools = buildToolAnalyses(data.tools, data.teamSize, totalMonthly);

  // Link recommendations to their tools
  for (const rec of recommendations) {
    for (const toolId of rec.toolIds) {
      const toolAnalysis = tools.find((t) => t.toolId === toolId);
      if (toolAnalysis) {
        toolAnalysis.recommendationIds.push(rec.id);
        toolAnalysis.status = "has-savings";
      }
    }
  }

  // ── Step 8: Compute summary metrics ─────────────────────────────────────
  const totalMonthlySavings = round2(
    recommendations.reduce((sum, r) => sum + r.monthlySavings, 0)
  );
  const totalAnnualSavings = round2(totalMonthlySavings * 12);

  const savingsPercentage =
    totalMonthly > 0
      ? round2((totalMonthlySavings / totalMonthly) * 100)
      : 0;

  // Count metrics for health score
  const billingInefficiencies = recommendations.filter(
    (r) => r.type === "switch-billing"
  ).length;
  const redundantToolPairs = recommendations.filter(
    (r) => r.type === "consolidate-tools"
  ).length;

  const healthScore = calculateHealthScore(
    savingsPercentage,
    redundantToolPairs,
    billingInefficiencies
  );

  const actionableCount = recommendations.filter(
    (r) => r.monthlySavings > 0
  ).length;
  const highConfidenceCount = recommendations.filter(
    (r) => r.confidence === "high"
  ).length;

  // ── Step 9: Assemble final report ───────────────────────────────────────
  return {
    generatedAt: new Date().toISOString(),
    teamName: data.teamName,
    teamSize: data.teamSize,
    toolCount: data.tools.length,
    spend,
    tools,
    recommendations,
    summary: {
      totalMonthlySavings,
      totalAnnualSavings,
      savingsPercentage,
      actionableCount,
      highConfidenceCount,
      healthScore,
    },
  };
}

// ─── Deduplication ──────────────────────────────────────────────────────────

/**
 * Remove duplicate / conflicting recommendations.
 *
 * Conflicts:
 * - If Rule A says "downgrade Cursor" and Rule B says "drop Cursor entirely",
 *   keep only the higher-savings recommendation.
 * - If the same tool has both "switch to annual" and "downgrade", keep both
 *   (they're complementary, not conflicting).
 */
function deduplicateRecommendations(
  recs: Recommendation[]
): Recommendation[] {
  const toolRecMap = new Map<string, Recommendation[]>();

  for (const rec of recs) {
    for (const toolId of rec.toolIds) {
      const existing = toolRecMap.get(toolId) ?? [];
      existing.push(rec);
      toolRecMap.set(toolId, existing);
    }
  }

  const toRemove = new Set<string>();

  for (const [, toolRecs] of toolRecMap) {
    // Check for conflicting recommendation types on the same tool
    const conflictGroups: Record<string, Recommendation[]> = {};

    for (const rec of toolRecs) {
      // These types conflict with each other (can't downgrade AND switch tool)
      const conflictKey = getConflictGroup(rec.type);
      if (!conflictGroups[conflictKey]) {
        conflictGroups[conflictKey] = [];
      }
      conflictGroups[conflictKey].push(rec);
    }

    // For each conflict group, keep only the best recommendation
    for (const [, group] of Object.entries(conflictGroups)) {
      if (group.length <= 1) continue;

      // Sort by savings descending, then by confidence
      group.sort((a, b) => {
        if (b.monthlySavings !== a.monthlySavings) {
          return b.monthlySavings - a.monthlySavings;
        }
        const confOrder = { high: 3, medium: 2, low: 1 };
        return confOrder[b.confidence] - confOrder[a.confidence];
      });

      // Keep the first (best), remove the rest
      for (let i = 1; i < group.length; i++) {
        toRemove.add(group[i].id);
      }
    }
  }

  return recs.filter((r) => !toRemove.has(r.id));
}

/**
 * Map recommendation types to conflict groups.
 * Types in the same group are mutually exclusive for the same tool.
 */
function getConflictGroup(type: string): string {
  const groups: Record<string, string> = {
    "downgrade-plan": "plan-change",
    "right-size-enterprise": "plan-change",
    "drop-free-tier": "plan-change",
    "switch-tool": "tool-existence",
    "consolidate-tools": "tool-existence",
  };
  // Types not in any group don't conflict (e.g. annual billing + seat reduction)
  return groups[type] ?? type;
}
