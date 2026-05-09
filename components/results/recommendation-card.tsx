"use client";

/**
 * components/results/recommendation-card.tsx
 * Premium recommendation card with confidence badge, savings highlight,
 * expandable explanation, and action/tradeoff sections.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Shield,
  Gauge,
  CircleDot,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Recommendation, Confidence } from "@/lib/engine/audit-types";
import { getToolById } from "@/config/pricing";

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
}

const CONFIDENCE_CONFIG: Record<
  Confidence,
  { label: string; color: string; icon: React.ElementType }
> = {
  high: {
    label: "High confidence",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: Shield,
  },
  medium: {
    label: "Medium confidence",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    icon: Gauge,
  },
  low: {
    label: "Worth exploring",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    icon: CircleDot,
  },
};

const TYPE_LABELS: Record<string, string> = {
  "downgrade-plan": "Plan Downgrade",
  "switch-billing": "Billing Optimisation",
  "reduce-seats": "Seat Reduction",
  "consolidate-tools": "Tool Consolidation",
  "switch-tool": "Alternative Tool",
  "drop-free-tier": "Free Tier",
  "api-optimisation": "API Optimisation",
  "right-size-enterprise": "Right-size Plan",
  "no-action": "No Action Needed",
};

export function RecommendationCard({
  recommendation: rec,
  index,
}: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const conf = CONFIDENCE_CONFIG[rec.confidence];
  const ConfIcon = conf.icon;

  const toolNames = rec.toolIds
    .map((id) => getToolById(id)?.name ?? id)
    .join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.35 }}
      className="group rounded-xl border border-border/50 bg-card/40 overflow-hidden hover:border-border/80 transition-colors"
    >
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-5 flex items-start gap-4"
      >
        {/* Savings badge */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[64px]">
          <span className="text-lg font-bold text-emerald-400">
            {formatCurrency(rec.monthlySavings)}
          </span>
          <span className="text-[10px] text-muted-foreground">/mo</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {TYPE_LABELS[rec.type] ?? rec.type}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                conf.color
              )}
            >
              <ConfIcon className="h-2.5 w-2.5" />
              {conf.label}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-foreground leading-snug">
            {rec.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {toolNames}
          </p>
        </div>

        {/* Expand icon */}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 mt-1",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border/30 pt-4">
              {/* Explanation */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {rec.explanation}
              </p>

              {/* Cost comparison */}
              <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(rec.currentMonthlyCost)}/mo
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Proposed</p>
                  <p className="text-sm font-semibold text-emerald-400">
                    {formatCurrency(rec.proposedMonthlyCost)}/mo
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-muted-foreground">Annual savings</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {formatCurrency(rec.annualSavings)}/yr
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-start gap-2.5">
                <TrendingDown className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">
                    Recommended action
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {rec.action}
                  </p>
                </div>
              </div>

              {/* Tradeoff */}
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">
                    Tradeoff to consider
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {rec.tradeoff}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
