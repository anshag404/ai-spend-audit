/**
 * lib/engine/rules.ts
 * Modular, declarative recommendation rules.
 *
 * Architecture: each rule is a pure function that takes the full audit
 * context and returns 0 or more Recommendations. Rules are independent —
 * adding a new rule never breaks existing ones. The engine runs all rules
 * and deduplicates / resolves conflicts at the orchestrator level.
 *
 * IMPORTANT: No AI. No LLMs. No external APIs. Every recommendation is
 * traceable to a specific financial rule with clear math.
 */
import type { AuditToolEntry, AuditFormData } from "@/types/audit";
import type { Recommendation, Confidence } from "./audit-types";
import { effectiveMonthly, costOnPlan, annualSwitchSavings, round2 } from "./calculator";
import { getToolById, AI_TOOLS } from "@/config/pricing";

// ─── Rule context (passed to every rule) ────────────────────────────────────
export interface RuleContext {
  /** All user-entered tool entries */
  entries: AuditToolEntry[];
  /** Team size */
  teamSize: number;
  /** Team name */
  teamName: string;
  /** Total current monthly spend */
  totalMonthly: number;
}

/** A rule function signature. */
export type RuleFunction = (ctx: RuleContext) => Recommendation[];

// ─── ID generation ──────────────────────────────────────────────────────────
let _ruleCounter = 0;
function ruleId(prefix: string): string {
  _ruleCounter++;
  return `${prefix}-${_ruleCounter}`;
}

/** Reset counter (useful for tests). */
export function resetRuleCounter(): void {
  _ruleCounter = 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// RULE 1: ANNUAL BILLING SWITCH
// ═══════════════════════════════════════════════════════════════════════════
/**
 * If a tool has an annual plan option and the user is paying monthly,
 * recommend switching. Typical SaaS annual discounts are 15-20%.
 *
 * Confidence:
 * - High if savings > $10/mo (material)
 * - Medium if savings $3-10/mo
 * - Low if savings < $3/mo (not worth the lock-in hassle)
 */
export const ruleAnnualBilling: RuleFunction = (ctx) => {
  const recs: Recommendation[] = [];

  for (const entry of ctx.entries) {
    const savings = annualSwitchSavings(entry);
    if (savings <= 0) continue;

    const tool = getToolById(entry.toolId);
    if (!tool) continue;

    const plan = tool.plans.find((p) => p.id === entry.planId);
    if (!plan) continue;

    const currentMonthly = effectiveMonthly(entry);
    const proposedMonthly = round2(currentMonthly - savings);
    const annualSavings = round2(savings * 12);

    const confidence: Confidence =
      savings > 10 ? "high" : savings > 3 ? "medium" : "low";

    const savingsPct = round2(
      (savings / currentMonthly) * 100
    );

    recs.push({
      id: ruleId("annual"),
      toolIds: [entry.toolId],
      type: "switch-billing",
      confidence,
      title: `Switch ${tool.name} to annual billing`,
      explanation:
        `You're paying $${plan.priceMonthly}/seat/mo for ${tool.name} ${plan.name}. ` +
        `The annual plan costs $${round2((plan.priceAnnual ?? 0) / 12)}/seat/mo — ` +
        `a ${savingsPct}% discount. ` +
        `With ${entry.seats} seat${entry.seats > 1 ? "s" : ""}, ` +
        `that's ${formatSavings(savings)}/mo or ${formatSavings(annualSavings)}/yr.`,
      monthlySavings: savings,
      annualSavings,
      currentMonthlyCost: currentMonthly,
      proposedMonthlyCost: proposedMonthly,
      action: `Switch ${tool.name} from monthly to annual billing on your next renewal.`,
      tradeoff:
        savings > 10
          ? "Annual billing requires upfront commitment. Ensure you'll use this tool for the full year."
          : "The savings are modest — only worth it if you're certain about continued usage.",
    });
  }

  return recs;
};

// ═══════════════════════════════════════════════════════════════════════════
// RULE 2: PLAN DOWNGRADE
// ═══════════════════════════════════════════════════════════════════════════
/**
 * If a user is on a high-tier plan but their team is small or their use
 * case doesn't require enterprise features, recommend downgrading.
 *
 * Decision matrix:
 * - Business/Enterprise plan + team < 5 → likely overkill
 * - Team plan + team == 1 → individual plan sufficient
 * - Enterprise features (SSO, audit logs) rarely needed under 20 people
 */
export const rulePlanDowngrade: RuleFunction = (ctx) => {
  const recs: Recommendation[] = [];

  for (const entry of ctx.entries) {
    const tool = getToolById(entry.toolId);
    if (!tool) continue;

    const plan = tool.plans.find((p) => p.id === entry.planId);
    if (!plan) continue;

    const currentMonthly = effectiveMonthly(entry);

    // Find the plan one tier below
    const planIndex = tool.plans.indexOf(plan);
    if (planIndex <= 0) continue; // Already on the lowest plan

    // Skip free plans — can't downgrade further meaningfully
    if (plan.priceMonthly === 0) continue;

    const lowerPlan = tool.plans[planIndex - 1];

    // ── Business/Enterprise on tiny team ────────────────────────────
    const isEnterpriseTier = /business|enterprise|team|scale/i.test(plan.name);
    const isSmallTeam = ctx.teamSize < 5;
    const isVerySmallTeam = ctx.teamSize <= 2;

    if (isEnterpriseTier && isSmallTeam) {
      const proposedMonthly = costOnPlan(
        entry.toolId,
        lowerPlan.id,
        entry.seats,
        entry.billingCycle
      );
      const savings = round2(currentMonthly - proposedMonthly);

      if (savings <= 0) continue;

      const confidence: Confidence = isVerySmallTeam ? "high" : "medium";

      recs.push({
        id: ruleId("downgrade"),
        toolIds: [entry.toolId],
        type: isVerySmallTeam ? "right-size-enterprise" : "downgrade-plan",
        confidence,
        title: `Downgrade ${tool.name} from ${plan.name} to ${lowerPlan.name}`,
        explanation:
          `Your team has ${ctx.teamSize} member${ctx.teamSize > 1 ? "s" : ""}. ` +
          `${tool.name} ${plan.name} ($${plan.priceMonthly}/seat/mo) includes enterprise features ` +
          `like ${plan.features.slice(0, 2).join(" and ")} that teams under ` +
          `${isVerySmallTeam ? "3" : "5"} people rarely use. ` +
          `${lowerPlan.name} ($${lowerPlan.priceMonthly}/seat/mo) covers the core functionality ` +
          `and saves ${formatSavings(savings)}/mo.`,
        monthlySavings: savings,
        annualSavings: round2(savings * 12),
        currentMonthlyCost: currentMonthly,
        proposedMonthlyCost: proposedMonthly,
        action: `Downgrade ${tool.name} to the ${lowerPlan.name} plan. Review if you actually need: ${plan.features.slice(0, 2).join(", ")}.`,
        tradeoff: `You'll lose access to ${plan.features[0]}. If compliance or IT policies require these features, keep the current plan.`,
      });
    }
  }

  return recs;
};

// ═══════════════════════════════════════════════════════════════════════════
// RULE 3: SEAT REDUCTION
// ═══════════════════════════════════════════════════════════════════════════
/**
 * If a tool has more seats than team members, there are ghost licenses.
 *
 * This is extremely common — teams hire, fire, and forget to update seats.
 * The savings are often the biggest line item in a spend audit.
 *
 * Confidence: high (this is almost always actionable)
 */
export const ruleSeatReduction: RuleFunction = (ctx) => {
  const recs: Recommendation[] = [];

  for (const entry of ctx.entries) {
    if (entry.seats <= ctx.teamSize) continue;

    const tool = getToolById(entry.toolId);
    if (!tool) continue;

    const plan = tool.plans.find((p) => p.id === entry.planId);
    if (!plan || plan.usageBased) continue;
    if (plan.priceMonthly === 0) continue;

    const excessSeats = entry.seats - ctx.teamSize;
    const currentMonthly = effectiveMonthly(entry);

    // Recalculate with right-sized seats
    const proposedMonthly = costOnPlan(
      entry.toolId,
      entry.planId,
      ctx.teamSize,
      entry.billingCycle
    );
    const savings = round2(currentMonthly - proposedMonthly);

    if (savings <= 0) continue;

    recs.push({
      id: ruleId("seats"),
      toolIds: [entry.toolId],
      type: "reduce-seats",
      confidence: "high",
      title: `Remove ${excessSeats} unused ${tool.name} seat${excessSeats > 1 ? "s" : ""}`,
      explanation:
        `You're paying for ${entry.seats} ${tool.name} seats but your team has ${ctx.teamSize} ` +
        `member${ctx.teamSize > 1 ? "s" : ""}. That's ${excessSeats} unused license${excessSeats > 1 ? "s" : ""} ` +
        `at $${plan.priceMonthly}/seat/mo — pure waste of ${formatSavings(savings)}/mo. ` +
        `This is the easiest saving to capture: just remove the unused seats in your admin panel.`,
      monthlySavings: savings,
      annualSavings: round2(savings * 12),
      currentMonthlyCost: currentMonthly,
      proposedMonthlyCost: proposedMonthly,
      action: `Go to ${tool.name} admin settings → remove ${excessSeats} seat${excessSeats > 1 ? "s" : ""} to match your team size of ${ctx.teamSize}.`,
      tradeoff: "None if the seats are truly unused. Double-check with your team that no contractors or part-time members need access.",
    });
  }

  return recs;
};

// ═══════════════════════════════════════════════════════════════════════════
// RULE 4: TOOL CONSOLIDATION (SAME CATEGORY)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * If two or more tools are in the same category, there's likely overlap.
 *
 * Example: Cursor + Copilot are both coding assistants. Most engineers
 * primarily use one. Keeping both costs double for marginal benefit.
 *
 * We suggest dropping the more expensive one unless the cheaper one
 * is on a free tier (in which case keeping it is fine).
 *
 * Confidence:
 * - High if both are paid and same category
 * - Medium if one is free (overlap exists but cost is minimal)
 */
export const ruleConsolidateTools: RuleFunction = (ctx) => {
  const recs: Recommendation[] = [];
  const byCategory = new Map<string, AuditToolEntry[]>();

  for (const entry of ctx.entries) {
    const tool = getToolById(entry.toolId);
    if (!tool) continue;
    const list = byCategory.get(tool.category) ?? [];
    list.push(entry);
    byCategory.set(tool.category, list);
  }

  for (const [category, entries] of byCategory) {
    if (entries.length < 2) continue;

    // Sort by cost descending
    const sorted = entries
      .map((e) => ({ entry: e, cost: effectiveMonthly(e) }))
      .sort((a, b) => b.cost - a.cost);

    // Only recommend consolidation if 2+ are paid
    const paidTools = sorted.filter((s) => s.cost > 0);
    if (paidTools.length < 2) continue;

    // Recommend dropping the most expensive one
    const expensive = paidTools[0];
    const cheaper = paidTools[1];

    const expTool = getToolById(expensive.entry.toolId);
    const chpTool = getToolById(cheaper.entry.toolId);
    if (!expTool || !chpTool) continue;

    // Don't suggest consolidation for API platforms — they serve different models
    if (category === "api-platform") continue;

    const savings = round2(expensive.cost);

    recs.push({
      id: ruleId("consolidate"),
      toolIds: [expensive.entry.toolId, cheaper.entry.toolId],
      type: "consolidate-tools",
      confidence: "medium",
      title: `Consolidate: consider dropping ${expTool.name} in favour of ${chpTool.name}`,
      explanation:
        `You're paying for both ${expTool.name} (${formatSavings(expensive.cost)}/mo) and ` +
        `${chpTool.name} (${formatSavings(cheaper.cost)}/mo). ` +
        `Both are ${getCategoryLabel(category)} that serve similar purposes. ` +
        `Most teams find one sufficient — the overlap means you're likely paying double ` +
        `for capabilities you already have. Consolidating onto ${chpTool.name} would save ` +
        `${formatSavings(savings)}/mo.`,
      monthlySavings: savings,
      annualSavings: round2(savings * 12),
      currentMonthlyCost: round2(expensive.cost + cheaper.cost),
      proposedMonthlyCost: cheaper.cost,
      action: `Survey your team on which ${getCategoryLabel(category).toLowerCase()} they actually prefer, then cancel the other.`,
      tradeoff: `${expTool.name} may have unique features some team members rely on. Run a 1-week trial where everyone uses ${chpTool.name} before cancelling.`,
    });
  }

  return recs;
};

// ═══════════════════════════════════════════════════════════════════════════
// RULE 5: CHEAPER ALTERNATIVE EXISTS
// ═══════════════════════════════════════════════════════════════════════════
/**
 * If a tool is expensive and a direct cheaper competitor exists in our
 * catalog (same category, lower price), mention it.
 *
 * This is NOT the same as consolidation (Rule 4). Rule 4 applies when
 * the user already has both tools. This rule applies when they have one
 * expensive tool and a cheaper alternative they're NOT using.
 *
 * Confidence: low (switching tools has friction, we can't know if the
 * alternative actually fits their workflow).
 */
export const ruleCheaperAlternative: RuleFunction = (ctx) => {
  const recs: Recommendation[] = [];
  const usedToolIds = new Set(ctx.entries.map((e) => e.toolId));

  for (const entry of ctx.entries) {
    const tool = getToolById(entry.toolId);
    if (!tool) continue;

    const cost = effectiveMonthly(entry);
    if (cost === 0) continue; // Already free

    const plan = tool.plans.find((p) => p.id === entry.planId);
    if (!plan) continue;

    // Don't suggest alternatives for API platforms (switching APIs is hard)
    if (tool.category === "api-platform") continue;

    // Find cheaper alternatives in the same category that they DON'T already use
    const alternatives = AI_TOOLS
      .filter(
        (t) =>
          t.category === tool.category &&
          t.id !== tool.id &&
          !usedToolIds.has(t.id)
      )
      .map((alt) => {
        // Find the comparable plan (same tier name or closest by price)
        const comparablePlan =
          alt.plans.find((p) => p.name.toLowerCase() === plan.name.toLowerCase()) ??
          alt.plans.find((p) => p.priceMonthly > 0 && p.priceMonthly < plan.priceMonthly) ??
          alt.plans.find((p) => p.priceMonthly > 0);

        if (!comparablePlan) return null;

        const altCost = comparablePlan.priceMonthly * entry.seats;
        return { tool: alt, plan: comparablePlan, cost: altCost };
      })
      .filter((a): a is NonNullable<typeof a> => a !== null)
      .filter((a) => a.cost < cost * 0.7); // Only suggest if >30% cheaper

    if (alternatives.length === 0) continue;

    // Pick the best alternative (cheapest)
    const best = alternatives.sort((a, b) => a.cost - b.cost)[0];
    const savings = round2(cost - best.cost);

    recs.push({
      id: ruleId("alt"),
      toolIds: [entry.toolId],
      type: "switch-tool",
      confidence: "low",
      title: `Consider ${best.tool.name} as a cheaper alternative to ${tool.name}`,
      explanation:
        `${tool.name} ${plan.name} costs ${formatSavings(cost)}/mo for ${entry.seats} seat${entry.seats > 1 ? "s" : ""}. ` +
        `${best.tool.name} ${best.plan.name} offers similar capabilities at ` +
        `$${best.plan.priceMonthly}/seat/mo (${formatSavings(best.cost)}/mo total). ` +
        `That's a potential saving of ${formatSavings(savings)}/mo, but switching tools ` +
        `has real friction — only worth exploring if you're not deeply invested in ${tool.name}'s ecosystem.`,
      monthlySavings: savings,
      annualSavings: round2(savings * 12),
      currentMonthlyCost: cost,
      proposedMonthlyCost: best.cost,
      action: `Evaluate ${best.tool.name} with a free trial. If it meets your team's needs for ${entry.useCase.replace(/-/g, " ")}, migrate gradually.`,
      tradeoff: `Switching tools disrupts workflows. ${tool.name} may have integrations or features that ${best.tool.name} lacks. Only pursue this if cost is a priority.`,
    });
  }

  return recs;
};

// ═══════════════════════════════════════════════════════════════════════════
// RULE 6: FREE TIER VIABLE
// ═══════════════════════════════════════════════════════════════════════════
/**
 * If a tool has a free tier and the user is on a paid plan but their
 * usage characteristics suggest the free tier might suffice.
 *
 * Signals for free-tier viability:
 * - Team size == 1 and on a "Team" or higher plan
 * - Use case is "research" (exploratory, not production-critical)
 * - Low seat count (1-2) on an individual tool
 *
 * Confidence: low (we don't have actual usage data, only signals)
 */
export const ruleFreeTierViable: RuleFunction = (ctx) => {
  const recs: Recommendation[] = [];

  for (const entry of ctx.entries) {
    const tool = getToolById(entry.toolId);
    if (!tool) continue;

    const plan = tool.plans.find((p) => p.id === entry.planId);
    if (!plan || plan.priceMonthly === 0) continue;

    const freePlan = tool.plans.find((p) => p.priceMonthly === 0);
    if (!freePlan) continue;

    const cost = effectiveMonthly(entry);

    // Only suggest free tier for low-stakes use cases
    const isLowStakes =
      entry.useCase === "research" ||
      entry.useCase === "other";

    const isSingleUser = entry.seats === 1;

    if (!isLowStakes || !isSingleUser) continue;

    recs.push({
      id: ruleId("free"),
      toolIds: [entry.toolId],
      type: "drop-free-tier",
      confidence: "low",
      title: `${tool.name}'s free tier may be enough for ${entry.useCase.replace(/-/g, " ")}`,
      explanation:
        `You're using ${tool.name} primarily for ${entry.useCase.replace(/-/g, " ")} with ${entry.seats} seat. ` +
        `The free tier (${freePlan.features.join(", ")}) may cover this use case. ` +
        `That would save ${formatSavings(cost)}/mo. However, free tiers have rate limits — ` +
        `this only works if your usage is light.`,
      monthlySavings: cost,
      annualSavings: round2(cost * 12),
      currentMonthlyCost: cost,
      proposedMonthlyCost: 0,
      action: `Try downgrading ${tool.name} to the free tier for one month. If you hit limits frequently, upgrade back.`,
      tradeoff: `Free tiers have strict limits (${freePlan.features[0]}). If this tool is critical to your workflow, keep the paid plan.`,
    });
  }

  return recs;
};

// ═══════════════════════════════════════════════════════════════════════════
// RULE 7: API SPEND OPTIMISATION
// ═══════════════════════════════════════════════════════════════════════════
/**
 * For usage-based API platforms, check if the spend seems high relative
 * to team size and suggest optimisations.
 *
 * Heuristic: if API spend > $50/team member/month, there may be
 * inefficiencies (e.g. retries, verbose prompts, lack of caching).
 *
 * This is a soft recommendation — we can't know actual token usage.
 */
export const ruleApiOptimisation: RuleFunction = (ctx) => {
  const recs: Recommendation[] = [];

  for (const entry of ctx.entries) {
    const tool = getToolById(entry.toolId);
    if (!tool) continue;

    const plan = tool.plans.find((p) => p.id === entry.planId);
    if (!plan?.usageBased) continue;

    const cost = effectiveMonthly(entry);
    const perMember = ctx.teamSize > 0 ? cost / ctx.teamSize : cost;

    if (perMember < 50) continue; // Under $50/person is reasonable

    // Estimate 15-25% can typically be saved through prompt optimisation,
    // caching, and model selection (e.g. using GPT-4o mini for simple tasks)
    const savingsRate = perMember > 200 ? 0.25 : perMember > 100 ? 0.20 : 0.15;
    const savings = round2(cost * savingsRate);

    const confidence: Confidence = perMember > 200 ? "medium" : "low";

    recs.push({
      id: ruleId("api"),
      toolIds: [entry.toolId],
      type: "api-optimisation",
      confidence,
      title: `Optimise ${tool.name} API usage (est. ${Math.round(savingsRate * 100)}% savings)`,
      explanation:
        `Your ${tool.name} spend is ${formatSavings(cost)}/mo, which works out to ` +
        `${formatSavings(perMember)}/team member/mo. That's on the higher end. ` +
        `Common optimisations include: using cheaper models for simple tasks ` +
        `(e.g. GPT-4o mini instead of GPT-4o), implementing response caching, ` +
        `reducing prompt verbosity, and batching requests. ` +
        `A ${Math.round(savingsRate * 100)}% reduction is realistic, saving ~${formatSavings(savings)}/mo.`,
      monthlySavings: savings,
      annualSavings: round2(savings * 12),
      currentMonthlyCost: cost,
      proposedMonthlyCost: round2(cost - savings),
      action: `Audit your API usage: check for retries, verbose prompts, and whether cheaper models suffice for simple queries. Consider adding a caching layer.`,
      tradeoff: `API optimisation requires engineering effort. The ROI depends on your team's capacity — may not be worth it if you're shipping fast.`,
    });
  }

  return recs;
};

// ═══════════════════════════════════════════════════════════════════════════
// RULE 8: CHATGPT PRO ($200) AUDIT
// ═══════════════════════════════════════════════════════════════════════════
/**
 * ChatGPT Pro at $200/mo is 10x the price of Plus. Very few individuals
 * need "unlimited o1 pro mode". If a small team has Pro seats, flag it.
 */
export const ruleChatGptProAudit: RuleFunction = (ctx) => {
  const recs: Recommendation[] = [];

  for (const entry of ctx.entries) {
    if (entry.planId !== "chatgpt-pro") continue;

    const cost = effectiveMonthly(entry);
    const plusCost = costOnPlan(entry.toolId, "chatgpt-plus", entry.seats, entry.billingCycle);
    const savings = round2(cost - plusCost);

    if (savings <= 0) continue;

    recs.push({
      id: ruleId("gptpro"),
      toolIds: [entry.toolId],
      type: "downgrade-plan",
      confidence: "high",
      title: `Review ChatGPT Pro ($200/mo) — Plus ($20/mo) covers most use cases`,
      explanation:
        `ChatGPT Pro costs $200/seat/mo — 10× the price of Plus ($20/seat/mo). ` +
        `The key differentiator is "unlimited o1 pro mode", which most teams don't ` +
        `need for day-to-day work. With ${entry.seats} seat${entry.seats > 1 ? "s" : ""}, ` +
        `downgrading saves ${formatSavings(savings)}/mo (${formatSavings(round2(savings * 12))}/yr). ` +
        `Plus still includes GPT-4o, DALL-E, and Advanced Data Analysis.`,
      monthlySavings: savings,
      annualSavings: round2(savings * 12),
      currentMonthlyCost: cost,
      proposedMonthlyCost: plusCost,
      action: `Downgrade ChatGPT to the Plus plan unless specific team members need o1 pro mode for complex reasoning tasks.`,
      tradeoff: `You lose access to o1 pro mode and unlimited usage caps. If any team member relies on these for critical work, consider keeping one Pro seat.`,
    });
  }

  return recs;
};

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED RULE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════
/**
 * All rules in execution order.
 *
 * Order matters slightly for ID generation but NOT for correctness —
 * rules are independent. We order high-impact rules first for readability.
 */
export const ALL_RULES: RuleFunction[] = [
  ruleSeatReduction,        // Easiest wins first
  ruleAnnualBilling,        // Low-friction savings
  rulePlanDowngrade,        // Right-size plans
  ruleChatGptProAudit,      // Specific high-impact rule
  ruleConsolidateTools,     // Cross-tool analysis
  ruleCheaperAlternative,   // Market alternatives
  ruleFreeTierViable,       // For light users
  ruleApiOptimisation,      // Usage-based optimisation
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatSavings(amount: number): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    "coding-assistant": "coding assistants",
    "chat-assistant": "chat assistants",
    "api-platform": "API platforms",
    "design-tool": "design tools",
  };
  return labels[category] ?? category;
}
