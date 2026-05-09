"use client";

/**
 * components/results/ai-summary.tsx
 * AI-generated personalized summary with graceful fallback.
 *
 * Strategy:
 * 1. Try to call /api/ai-summary with the report data
 * 2. If that fails (no API key, rate limit, network error), use a
 *    deterministic fallback that generates a founder-friendly summary
 *    from the report data directly (no AI needed).
 *
 * The fallback is always good enough — the AI just makes it "sparkle."
 */
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuditReport } from "@/lib/engine/audit-types";
import { formatCurrency } from "@/lib/utils";

interface AiSummaryProps {
  report: AuditReport;
}

type SummaryState =
  | { status: "loading" }
  | { status: "success"; text: string; isAi: boolean }
  | { status: "error"; text: string };

/**
 * Generate a deterministic fallback summary.
 * ~100 words, founder-friendly, action-oriented.
 * This is the backbone — always works, no API needed.
 */
function generateFallbackSummary(report: AuditReport): string {
  const { summary, spend, recommendations, teamName, toolCount, teamSize } =
    report;

  if (summary.totalAnnualSavings === 0) {
    return (
      `${teamName}'s AI stack of ${toolCount} tool${toolCount > 1 ? "s" : ""} is well-optimised ` +
      `for a team of ${teamSize}. Your current spend of ${formatCurrency(spend.totalMonthly)}/mo ` +
      `(${formatCurrency(spend.totalAnnual)}/yr) is lean with no obvious waste. ` +
      `Your spend health score is ${summary.healthScore}/100 — keep doing what you're doing. ` +
      `We'll keep monitoring for new savings opportunities as pricing changes.`
    );
  }

  const topRec = recommendations[0];
  const highConfCount = summary.highConfidenceCount;

  const quickWins = recommendations
    .filter((r) => r.confidence === "high")
    .slice(0, 2)
    .map((r) => r.title.toLowerCase());

  return (
    `${teamName} is spending ${formatCurrency(spend.totalMonthly)}/mo ` +
    `(${formatCurrency(spend.totalAnnual)}/yr) across ${toolCount} AI tool${toolCount > 1 ? "s" : ""} ` +
    `for a team of ${teamSize}. We found ${formatCurrency(summary.totalAnnualSavings)}/yr in potential savings — ` +
    `that's ${summary.savingsPercentage}% of your current spend. ` +
    (highConfCount > 0
      ? `You have ${highConfCount} high-confidence recommendation${highConfCount > 1 ? "s" : ""} you can act on today. `
      : "") +
    `The biggest opportunity: ${topRec.title.toLowerCase()}, ` +
    `saving ${formatCurrency(topRec.annualSavings)}/yr. ` +
    (quickWins.length > 1
      ? `Start with: ${quickWins.join(" and ")}.`
      : `Start there for the highest ROI.`)
  );
}

export function AiSummary({ report }: AiSummaryProps) {
  const [state, setState] = useState<SummaryState>({ status: "loading" });

  const fetchSummary = useCallback(async () => {
    setState({ status: "loading" });

    try {
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report }),
        signal: AbortSignal.timeout(8000), // 8s timeout
      });

      if (!res.ok) throw new Error(`API returned ${res.status}`);

      const data = await res.json();
      setState({ status: "success", text: data.summary, isAi: true });
    } catch {
      // Graceful fallback — the deterministic summary is always good
      const fallback = generateFallbackSummary(report);
      setState({ status: "success", text: fallback, isAi: false });
    }
  }, [report]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSummary();
  }, [fetchSummary]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="rounded-xl border border-brand/20 bg-gradient-to-br from-brand/5 to-transparent p-5 sm:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Executive Summary
            </h3>
            {state.status === "success" && (
              <p className="text-[10px] text-muted-foreground">
                {state.isAi
                  ? "AI-generated personalized analysis"
                  : "Generated from your audit data"}
              </p>
            )}
          </div>
        </div>

        {state.status === "success" && !state.isAi && (
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSummary}
            className="text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Retry AI
          </Button>
        )}
      </div>

      {/* Content */}
      {state.status === "loading" && (
        <div className="space-y-2.5">
          <div className="h-3 w-full rounded bg-muted/40 animate-shimmer" />
          <div className="h-3 w-11/12 rounded bg-muted/40 animate-shimmer delay-100" />
          <div className="h-3 w-4/5 rounded bg-muted/40 animate-shimmer delay-200" />
          <div className="h-3 w-9/12 rounded bg-muted/40 animate-shimmer delay-300" />
        </div>
      )}

      {state.status === "success" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-sm text-muted-foreground leading-relaxed"
        >
          {state.text}
        </motion.p>
      )}

      {state.status === "error" && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p>{state.text}</p>
        </div>
      )}
    </motion.div>
  );
}
