/**
 * lib/engine/__tests__/engine.test.ts
 * Unit tests for the audit engine.
 *
 * Tests cover:
 * 1. Calculator functions (financial math)
 * 2. Individual rules (business logic)
 * 3. Full engine integration (end-to-end)
 * 4. Edge cases (empty inputs, zero values, single tools)
 */
import { describe, it, expect, beforeEach } from "vitest";
import { effectiveMonthly, annualSwitchSavings, round2, buildSpendBreakdown, calculateHealthScore } from "../calculator";
import {
  ruleAnnualBilling,
  ruleSeatReduction,
  rulePlanDowngrade,
  ruleConsolidateTools,
  ruleChatGptProAudit,
  ruleApiOptimisation,
  resetRuleCounter,
} from "../rules";
import type { RuleContext } from "../rules";
import { runAudit } from "../recommendation-engine";
import type { AuditToolEntry, AuditFormData } from "@/types/audit";

// ─── Test fixtures ──────────────────────────────────────────────────────────

function makeCursorPro(seats = 1): AuditToolEntry {
  return {
    toolId: "cursor",
    planId: "cursor-pro",
    billingCycle: "monthly",
    seats,
    monthlySpend: 20 * seats,
    useCase: "code-generation",
  };
}

function makeCopilotBusiness(seats = 1): AuditToolEntry {
  return {
    toolId: "github-copilot",
    planId: "copilot-business",
    billingCycle: "monthly",
    seats,
    monthlySpend: 19 * seats,
    useCase: "code-generation",
  };
}

function makeChatGptPro(seats = 1): AuditToolEntry {
  return {
    toolId: "chatgpt",
    planId: "chatgpt-pro",
    billingCycle: "monthly",
    seats,
    monthlySpend: 200 * seats,
    useCase: "chat-support",
  };
}

function makeOpenAiApi(monthlySpend = 500): AuditToolEntry {
  return {
    toolId: "openai-api",
    planId: "openai-api-payg",
    billingCycle: "monthly",
    seats: 1,
    monthlySpend,
    useCase: "code-generation",
  };
}

function makeCtx(
  entries: AuditToolEntry[],
  teamSize = 5
): RuleContext {
  return {
    entries,
    teamSize,
    teamName: "TestCorp",
    totalMonthly: entries.reduce((s, e) => s + effectiveMonthly(e), 0),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. CALCULATOR TESTS
// ═══════════════════════════════════════════════════════════════════════════
describe("Calculator", () => {
  describe("effectiveMonthly", () => {
    it("calculates monthly cost for fixed plan", () => {
      const entry = makeCursorPro(3);
      expect(effectiveMonthly(entry)).toBe(60); // $20 × 3 seats
    });

    it("uses user-reported spend if higher (catches add-ons)", () => {
      const entry = makeCursorPro(1);
      entry.monthlySpend = 25; // User says $25 — trust them
      expect(effectiveMonthly(entry)).toBe(25);
    });

    it("uses computed cost when user under-reports", () => {
      const entry = makeCursorPro(3);
      entry.monthlySpend = 10; // User says $10 but 3 seats × $20 = $60
      expect(effectiveMonthly(entry)).toBe(60);
    });

    it("trusts user spend for usage-based plans", () => {
      const entry = makeOpenAiApi(1200);
      expect(effectiveMonthly(entry)).toBe(1200);
    });

    it("handles annual billing correctly", () => {
      const entry = makeCursorPro(1);
      entry.billingCycle = "annual";
      entry.monthlySpend = 16; // Annual: $192/yr = $16/mo
      // Annual price is $192/yr = $16/mo
      expect(effectiveMonthly(entry)).toBe(16);
    });
  });

  describe("annualSwitchSavings", () => {
    it("calculates savings when switching from monthly to annual", () => {
      const entry = makeCursorPro(1);
      // Monthly: $20/mo. Annual: $192/yr = $16/mo. Savings: $4/mo
      expect(annualSwitchSavings(entry)).toBe(4);
    });

    it("returns 0 when already on annual billing", () => {
      const entry = makeCursorPro(1);
      entry.billingCycle = "annual";
      expect(annualSwitchSavings(entry)).toBe(0);
    });

    it("returns 0 for plans without annual option", () => {
      const entry = makeChatGptPro(1); // ChatGPT Pro has no annual plan
      expect(annualSwitchSavings(entry)).toBe(0);
    });

    it("scales with seat count", () => {
      const entry = makeCursorPro(5);
      // 5 seats × ($20 - $16) = $20/mo
      expect(annualSwitchSavings(entry)).toBe(20);
    });
  });

  describe("round2", () => {
    it("rounds to 2 decimal places", () => {
      expect(round2(3.14159)).toBe(3.14);
      expect(round2(10)).toBe(10);
      expect(round2(0.005)).toBe(0.01);
    });
  });

  describe("buildSpendBreakdown", () => {
    it("calculates total monthly and annual spend", () => {
      const entries = [makeCursorPro(2), makeCopilotBusiness(3)];
      const breakdown = buildSpendBreakdown(entries, 5);

      expect(breakdown.totalMonthly).toBe(97); // (20×2) + (19×3)
      expect(breakdown.totalAnnual).toBe(1164); // 97 × 12
    });

    it("identifies top spender", () => {
      const entries = [makeCursorPro(1), makeChatGptPro(1)];
      const breakdown = buildSpendBreakdown(entries, 3);

      expect(breakdown.topSpender.toolId).toBe("chatgpt");
      expect(breakdown.topSpender.monthlyCost).toBe(200);
    });

    it("calculates cost per team member", () => {
      const entries = [makeCursorPro(5)]; // $100/mo total
      const breakdown = buildSpendBreakdown(entries, 10);

      expect(breakdown.costPerTeamMember).toBe(10); // $100 / 10 members
    });
  });

  describe("calculateHealthScore", () => {
    it("returns 100 for fully optimised setup", () => {
      expect(calculateHealthScore(0, 0, 0)).toBe(100);
    });

    it("deducts for savings percentage", () => {
      const score = calculateHealthScore(20, 0, 0);
      expect(score).toBe(80); // 100 - 20
    });

    it("deducts for redundant tools", () => {
      const score = calculateHealthScore(0, 2, 0);
      expect(score).toBe(84); // 100 - (2 × 8)
    });

    it("never goes below 0", () => {
      expect(calculateHealthScore(50, 5, 10)).toBeGreaterThanOrEqual(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. INDIVIDUAL RULE TESTS
// ═══════════════════════════════════════════════════════════════════════════
describe("Rules", () => {
  beforeEach(() => resetRuleCounter());

  describe("ruleAnnualBilling", () => {
    it("suggests annual billing when savings exist", () => {
      const ctx = makeCtx([makeCursorPro(1)]);
      const recs = ruleAnnualBilling(ctx);

      expect(recs).toHaveLength(1);
      expect(recs[0].type).toBe("switch-billing");
      expect(recs[0].monthlySavings).toBe(4); // $20 - $16
    });

    it("skips tools already on annual billing", () => {
      const entry = makeCursorPro(1);
      entry.billingCycle = "annual";
      const ctx = makeCtx([entry]);
      const recs = ruleAnnualBilling(ctx);

      expect(recs).toHaveLength(0);
    });
  });

  describe("ruleSeatReduction", () => {
    it("flags excess seats", () => {
      const entry = makeCursorPro(10); // 10 seats
      const ctx = makeCtx([entry], 5); // Team of 5

      const recs = ruleSeatReduction(ctx);
      expect(recs).toHaveLength(1);
      expect(recs[0].type).toBe("reduce-seats");
      expect(recs[0].monthlySavings).toBe(100); // 5 excess seats × $20
      expect(recs[0].confidence).toBe("high");
    });

    it("does not flag when seats match team size", () => {
      const entry = makeCursorPro(5);
      const ctx = makeCtx([entry], 5);

      const recs = ruleSeatReduction(ctx);
      expect(recs).toHaveLength(0);
    });

    it("skips free plans", () => {
      const entry: AuditToolEntry = {
        toolId: "cursor",
        planId: "cursor-hobby",
        billingCycle: "monthly",
        seats: 10,
        monthlySpend: 0,
        useCase: "code-generation",
      };
      const ctx = makeCtx([entry], 3);
      const recs = ruleSeatReduction(ctx);
      expect(recs).toHaveLength(0);
    });
  });

  describe("rulePlanDowngrade", () => {
    it("suggests downgrade for enterprise plans on tiny teams", () => {
      const entry = makeCopilotBusiness(2); // Business plan
      const ctx = makeCtx([entry], 2); // Team of 2

      const recs = rulePlanDowngrade(ctx);
      expect(recs).toHaveLength(1);
      expect(recs[0].type).toBe("right-size-enterprise");
      expect(recs[0].confidence).toBe("high"); // Very small team
    });

    it("does not suggest downgrade for larger teams", () => {
      const entry = makeCopilotBusiness(10);
      const ctx = makeCtx([entry], 10);

      const recs = rulePlanDowngrade(ctx);
      expect(recs).toHaveLength(0);
    });
  });

  describe("ruleConsolidateTools", () => {
    it("suggests consolidation when two paid tools in same category", () => {
      const entries = [makeCursorPro(3), makeCopilotBusiness(3)]; // Both coding assistants
      const ctx = makeCtx(entries, 5);

      const recs = ruleConsolidateTools(ctx);
      expect(recs).toHaveLength(1);
      expect(recs[0].type).toBe("consolidate-tools");
      expect(recs[0].toolIds).toHaveLength(2);
    });

    it("does not consolidate API platforms", () => {
      const entries = [makeOpenAiApi(100), {
        toolId: "anthropic-api",
        planId: "anthropic-api-payg",
        billingCycle: "monthly" as const,
        seats: 1,
        monthlySpend: 100,
        useCase: "code-generation" as const,
      }];
      const ctx = makeCtx(entries, 5);

      const recs = ruleConsolidateTools(ctx);
      expect(recs).toHaveLength(0);
    });
  });

  describe("ruleChatGptProAudit", () => {
    it("flags ChatGPT Pro as overspend", () => {
      const ctx = makeCtx([makeChatGptPro(1)]);
      const recs = ruleChatGptProAudit(ctx);

      expect(recs).toHaveLength(1);
      expect(recs[0].monthlySavings).toBe(180); // $200 - $20
      expect(recs[0].confidence).toBe("high");
    });

    it("does not flag other ChatGPT plans", () => {
      const entry: AuditToolEntry = {
        toolId: "chatgpt",
        planId: "chatgpt-plus",
        billingCycle: "monthly",
        seats: 1,
        monthlySpend: 20,
        useCase: "chat-support",
      };
      const ctx = makeCtx([entry]);
      const recs = ruleChatGptProAudit(ctx);
      expect(recs).toHaveLength(0);
    });
  });

  describe("ruleApiOptimisation", () => {
    it("suggests optimisation for high API spend", () => {
      const ctx = makeCtx([makeOpenAiApi(1000)], 5); // $200/member
      const recs = ruleApiOptimisation(ctx);

      expect(recs).toHaveLength(1);
      expect(recs[0].type).toBe("api-optimisation");
      expect(recs[0].monthlySavings).toBeGreaterThan(0);
    });

    it("skips low API spend", () => {
      const ctx = makeCtx([makeOpenAiApi(50)], 5); // $10/member
      const recs = ruleApiOptimisation(ctx);
      expect(recs).toHaveLength(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. FULL ENGINE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════
describe("runAudit (integration)", () => {
  beforeEach(() => resetRuleCounter());

  it("produces a complete AuditReport", () => {
    const data: AuditFormData = {
      teamName: "AcmeCorp",
      teamSize: 5,
      tools: [makeCursorPro(5), makeCopilotBusiness(5), makeChatGptPro(2)],
    };

    const report = runAudit(data);

    // Structure
    expect(report.teamName).toBe("AcmeCorp");
    expect(report.teamSize).toBe(5);
    expect(report.toolCount).toBe(3);
    expect(report.generatedAt).toBeTruthy();

    // Spend
    expect(report.spend.totalMonthly).toBeGreaterThan(0);
    expect(report.spend.totalAnnual).toBe(report.spend.totalMonthly * 12);

    // Recommendations
    expect(report.recommendations.length).toBeGreaterThan(0);

    // Summary
    expect(report.summary.totalMonthlySavings).toBeGreaterThanOrEqual(0);
    expect(report.summary.healthScore).toBeGreaterThanOrEqual(0);
    expect(report.summary.healthScore).toBeLessThanOrEqual(100);

    // Recommendations are sorted by savings (descending)
    for (let i = 1; i < report.recommendations.length; i++) {
      expect(report.recommendations[i - 1].monthlySavings)
        .toBeGreaterThanOrEqual(report.recommendations[i].monthlySavings);
    }
  });

  it("finds ChatGPT Pro savings as a high-confidence recommendation", () => {
    const data: AuditFormData = {
      teamName: "TestCo",
      teamSize: 3,
      tools: [makeChatGptPro(3)],
    };

    const report = runAudit(data);
    const gptRec = report.recommendations.find(
      (r) => r.toolIds.includes("chatgpt") && r.type === "downgrade-plan"
    );

    expect(gptRec).toBeDefined();
    expect(gptRec!.monthlySavings).toBe(540); // 3 seats × ($200 - $20)
    expect(gptRec!.confidence).toBe("high");
  });

  it("handles excess seats + annual billing as separate recommendations", () => {
    const entry = makeCursorPro(10); // 10 seats on monthly billing
    const data: AuditFormData = {
      teamName: "SmallTeam",
      teamSize: 3,
      tools: [entry],
    };

    const report = runAudit(data);

    const seatRec = report.recommendations.find((r) => r.type === "reduce-seats");
    const annualRec = report.recommendations.find((r) => r.type === "switch-billing");

    // Both should be present — they're complementary, not conflicting
    expect(seatRec).toBeDefined();
    expect(annualRec).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. EDGE CASES
// ═══════════════════════════════════════════════════════════════════════════
describe("Edge cases", () => {
  beforeEach(() => resetRuleCounter());

  it("handles single tool with no savings", () => {
    const entry: AuditToolEntry = {
      toolId: "cursor",
      planId: "cursor-hobby",
      billingCycle: "monthly",
      seats: 1,
      monthlySpend: 0,
      useCase: "code-generation",
    };

    const report = runAudit({
      teamName: "Solo",
      teamSize: 1,
      tools: [entry],
    });

    expect(report.summary.totalMonthlySavings).toBe(0);
    expect(report.summary.healthScore).toBe(100);
  });

  it("handles team size of 1", () => {
    const data: AuditFormData = {
      teamName: "Freelancer",
      teamSize: 1,
      tools: [makeCursorPro(1)],
    };

    const report = runAudit(data);
    expect(report.spend.costPerTeamMember).toBe(20);
    expect(report.spend.averageCostPerSeat).toBe(20);
  });

  it("does not produce negative savings", () => {
    const data: AuditFormData = {
      teamName: "Edge",
      teamSize: 100,
      tools: [makeCursorPro(1), makeCopilotBusiness(1)],
    };

    const report = runAudit(data);
    for (const rec of report.recommendations) {
      expect(rec.monthlySavings).toBeGreaterThanOrEqual(0);
    }
  });
});
