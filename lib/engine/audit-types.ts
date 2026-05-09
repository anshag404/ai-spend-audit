/**
 * lib/engine/audit-types.ts
 * Output types for the deterministic audit engine.
 *
 * These describe what the engine *produces* — not what the user enters.
 * Input types live in types/audit.ts. The engine transforms inputs → outputs.
 */

// ─── Confidence level for a recommendation ──────────────────────────────────
export type Confidence = "high" | "medium" | "low";

// ─── Recommendation category ────────────────────────────────────────────────
export type RecommendationType =
  | "downgrade-plan"        // User is on a higher tier than needed
  | "switch-billing"        // Monthly → annual saves money
  | "reduce-seats"          // More seats licensed than team members
  | "consolidate-tools"     // Two tools cover the same use case
  | "switch-tool"           // A cheaper tool does the same job
  | "drop-free-tier"        // Paying for a tool that has a viable free tier
  | "api-optimisation"      // Usage-based spend can be reduced
  | "right-size-enterprise" // Enterprise plan on a small team
  | "no-action";            // Already well-optimised

// ─── Individual recommendation ──────────────────────────────────────────────
export interface Recommendation {
  /** Unique ID for this recommendation */
  id: string;
  /** Which tool(s) this applies to */
  toolIds: string[];
  /** Category of recommendation */
  type: RecommendationType;
  /** Confidence in this recommendation */
  confidence: Confidence;
  /** One-line summary, e.g. "Switch Cursor from Business to Pro" */
  title: string;
  /** Detailed explanation with financial reasoning */
  explanation: string;
  /** Monthly savings in USD (0 if no direct savings) */
  monthlySavings: number;
  /** Annual savings in USD */
  annualSavings: number;
  /** Current monthly cost for affected tool(s) */
  currentMonthlyCost: number;
  /** Proposed monthly cost after recommendation */
  proposedMonthlyCost: number;
  /** What the user should do — actionable instruction */
  action: string;
  /** Risk or trade-off of following this recommendation */
  tradeoff: string;
}

// ─── Per-tool analysis summary ──────────────────────────────────────────────
export interface ToolAnalysis {
  /** Tool ID from catalog */
  toolId: string;
  /** Tool display name */
  toolName: string;
  /** Current monthly cost */
  monthlyCost: number;
  /** Current annual cost */
  annualCost: number;
  /** Cost per team member per month */
  costPerMember: number;
  /** Percentage of total spend this tool represents */
  percentOfTotal: number;
  /** Recommendations that reference this tool */
  recommendationIds: string[];
  /** Quick status flag */
  status: "optimised" | "has-savings" | "review-needed";
}

// ─── Spend breakdown ────────────────────────────────────────────────────────
export interface SpendBreakdown {
  /** Total monthly spend across all tools */
  totalMonthly: number;
  /** Total annual spend (monthly × 12) */
  totalAnnual: number;
  /** Spend by category */
  byCategory: Record<string, number>;
  /** Highest-spend tool */
  topSpender: { toolId: string; toolName: string; monthlyCost: number };
  /** Average cost per seat across all tools */
  averageCostPerSeat: number;
  /** Average cost per team member (total spend / team size) */
  costPerTeamMember: number;
}

// ─── Complete audit result ──────────────────────────────────────────────────
export interface AuditReport {
  /** Timestamp of when this audit was generated */
  generatedAt: string;
  /** Team / company name from the input */
  teamName: string;
  /** Team size from the input */
  teamSize: number;
  /** Number of tools audited */
  toolCount: number;
  /** Spend breakdown */
  spend: SpendBreakdown;
  /** Per-tool analysis */
  tools: ToolAnalysis[];
  /** All recommendations, sorted by savings (highest first) */
  recommendations: Recommendation[];
  /** Summary metrics */
  summary: {
    /** Total potential monthly savings */
    totalMonthlySavings: number;
    /** Total potential annual savings */
    totalAnnualSavings: number;
    /** Savings as a percentage of current spend */
    savingsPercentage: number;
    /** Number of actionable recommendations */
    actionableCount: number;
    /** Number of high-confidence recommendations */
    highConfidenceCount: number;
    /** Health score 0–100 (100 = fully optimised) */
    healthScore: number;
  };
}
