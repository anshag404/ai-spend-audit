"use client";

/**
 * components/results/tool-breakdown.tsx
 * Per-tool analysis section with status indicators and cost metrics.
 */
import { motion } from "framer-motion";
import {
  MousePointerClick,
  GitBranch,
  Wind,
  MessageSquare,
  BookOpen,
  Sparkles,
  Cpu,
  Braces,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { ToolAnalysis } from "@/lib/engine/audit-types";
import { getToolById } from "@/config/pricing";

interface ToolBreakdownProps {
  tools: ToolAnalysis[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  MousePointerClick,
  Github: GitBranch,
  Wind,
  MessageSquare,
  BookOpen,
  Sparkles,
  Cpu,
  Braces,
};

export function ToolBreakdown({ tools }: ToolBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="rounded-xl border border-border/50 bg-card/40 p-5 sm:p-6"
    >
      <h3 className="text-sm font-semibold text-foreground mb-1">
        Tool-by-Tool Breakdown
      </h3>
      <p className="text-xs text-muted-foreground mb-5">
        Individual cost analysis for each tool in your stack
      </p>

      <div className="space-y-3">
        {tools.map((analysis, i) => {
          const tool = getToolById(analysis.toolId);
          const Icon = tool
            ? ICON_MAP[tool.iconName] ?? Cpu
            : Cpu;
          const hasRecs = analysis.status === "has-savings";

          return (
            <motion.div
              key={analysis.toolId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3.5 transition-colors",
                hasRecs
                  ? "border-amber-500/20 bg-amber-500/5"
                  : "border-border/30 bg-muted/10"
              )}
            >
              {/* Tool icon */}
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  backgroundColor: tool
                    ? `${tool.brandColor}15`
                    : "var(--muted)",
                  color: tool?.brandColor ?? "var(--muted-foreground)",
                }}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {analysis.toolName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {analysis.percentOfTotal}% of total ·{" "}
                  {formatCurrency(analysis.costPerMember)}/member
                </p>
              </div>

              {/* Cost + status */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-foreground">
                  {formatCurrency(analysis.monthlyCost)}/mo
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  {hasRecs ? (
                    <>
                      <AlertCircle className="h-3 w-3 text-amber-400" />
                      <span className="text-[10px] text-amber-400 font-medium">
                        {analysis.recommendationIds.length} suggestion
                        {analysis.recommendationIds.length > 1 ? "s" : ""}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-medium">
                        Optimised
                      </span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
