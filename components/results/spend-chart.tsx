"use client";

/**
 * components/results/spend-chart.tsx
 * Lightweight CSS-only bar chart showing spend by category.
 * No chart library needed — keeps the bundle small.
 */
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import type { SpendBreakdown } from "@/lib/engine/audit-types";

interface SpendChartProps {
  spend: SpendBreakdown;
}

const BAR_COLORS = [
  "bg-brand",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-blue-500",
  "bg-purple-500",
];

export function SpendChart({ spend }: SpendChartProps) {
  const categories = Object.entries(spend.byCategory).sort(
    ([, a], [, b]) => b - a
  );

  const maxValue = categories.length > 0 ? categories[0][1] : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="rounded-xl border border-border/50 bg-card/40 p-5 sm:p-6"
    >
      <h3 className="text-sm font-semibold text-foreground mb-1">
        Spend by Category
      </h3>
      <p className="text-xs text-muted-foreground mb-5">
        How your {formatCurrency(spend.totalMonthly)}/mo is distributed
      </p>

      <div className="space-y-4">
        {categories.map(([category, amount], i) => {
          const percentage = Math.round((amount / spend.totalMonthly) * 100);
          const barWidth = Math.max((amount / maxValue) * 100, 4);

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-foreground">
                  {category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(amount)}/mo ({percentage}%)
                </span>
              </div>
              <div className="relative h-2.5 rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{
                    delay: 0.5 + i * 0.1,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  className={`absolute inset-y-0 left-0 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Top spender: {spend.topSpender.toolName}
        </span>
        <span className="text-xs font-semibold text-foreground">
          {formatCurrency(spend.topSpender.monthlyCost)}/mo
        </span>
      </div>
    </motion.div>
  );
}
