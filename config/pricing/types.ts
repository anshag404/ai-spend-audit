/**
 * config/pricing/types.ts
 * Core types for the AI tool pricing configuration system.
 *
 * Architecture decision: pricing data is config-driven, not database-driven.
 * This lets us version-control pricing updates, add new tools without DB
 * migrations, and keeps Day 2 simple. When we wire Supabase on Day 3+
 * we store the user's *selections*, not the pricing catalog itself.
 */

// ─── Tool categories ─────────────────────────────────────────────────────────
export type ToolCategory =
  | "coding-assistant"
  | "chat-assistant"
  | "api-platform"
  | "design-tool";

// ─── Billing cadence ─────────────────────────────────────────────────────────
export type BillingCycle = "monthly" | "annual";

// ─── Use cases (for the form) ────────────────────────────────────────────────
export type UseCase =
  | "code-generation"
  | "code-review"
  | "chat-support"
  | "content-writing"
  | "data-analysis"
  | "internal-tools"
  | "customer-facing"
  | "research"
  | "other";

export const USE_CASE_LABELS: Record<UseCase, string> = {
  "code-generation": "Code Generation",
  "code-review": "Code Review & Debugging",
  "chat-support": "Chat / Support",
  "content-writing": "Content Writing",
  "data-analysis": "Data Analysis",
  "internal-tools": "Internal Tools",
  "customer-facing": "Customer-Facing Product",
  research: "Research & Exploration",
  other: "Other",
};

// ─── Plan ────────────────────────────────────────────────────────────────────
export interface ToolPlan {
  /** Unique plan ID, e.g. "copilot-individual" */
  id: string;
  /** Human-readable plan name */
  name: string;
  /** Monthly price per seat in USD */
  priceMonthly: number;
  /** Annual price per seat in USD (null = no annual option) */
  priceAnnual: number | null;
  /** Key features / limits for display */
  features: string[];
  /** Whether this is a usage-based plan where priceMonthly is an estimate */
  usageBased?: boolean;
}

// ─── AI Tool ─────────────────────────────────────────────────────────────────
export interface AiTool {
  /** Unique slug, e.g. "github-copilot" */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Tool category */
  category: ToolCategory;
  /** URL to the tool's website */
  website: string;
  /** Hex colour for the tool's brand accent (used in the UI) */
  brandColor: string;
  /** Lucide icon name (rendered dynamically) */
  iconName: string;
  /** Available pricing plans */
  plans: ToolPlan[];
}
