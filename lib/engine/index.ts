/**
 * lib/engine/index.ts
 * Public API for the audit engine.
 *
 * Only export what consumers need — hide internal implementation details.
 */

// The main entry point
export { runAudit } from "./recommendation-engine";

// Output types (consumers need these to render results)
export type {
  AuditReport,
  Recommendation,
  ToolAnalysis,
  SpendBreakdown,
  Confidence,
  RecommendationType,
} from "./audit-types";

// Calculator utilities (for display helpers)
export { formatCurrency } from "@/lib/utils";
export { round2, effectiveMonthly } from "./calculator";
