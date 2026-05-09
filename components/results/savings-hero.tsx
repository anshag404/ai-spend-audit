"use client";

/**
 * components/results/savings-hero.tsx
 * The headline "wow" section at the top of the results page.
 *
 * Shows total savings with an animated count-up, percentage badge,
 * and key metrics in a visually stunning card layout.
 */
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  TrendingDown,
  DollarSign,
  Users,
  Zap,
  ArrowDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { AuditReport } from "@/lib/engine/audit-types";

interface SavingsHeroProps {
  report: AuditReport;
}

/** Animate a number from 0 to `target` over `duration` ms. */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [target, duration]);

  return value;
}

export function SavingsHero({ report }: SavingsHeroProps) {
  const annualSavings = useCountUp(report.summary.totalAnnualSavings);
  const monthlySavings = useCountUp(report.summary.totalMonthlySavings);
  const healthScore = useCountUp(report.summary.healthScore);

  const hasSavings = report.summary.totalAnnualSavings > 0;

  const metrics = [
    {
      icon: DollarSign,
      label: "Current monthly spend",
      value: formatCurrency(report.spend.totalMonthly),
    },
    {
      icon: TrendingDown,
      label: "Potential monthly savings",
      value: formatCurrency(monthlySavings),
      highlight: true,
    },
    {
      icon: Users,
      label: "Cost per team member",
      value: `${formatCurrency(report.spend.costPerTeamMember)}/mo`,
    },
    {
      icon: Zap,
      label: "Actionable recommendations",
      value: String(report.summary.actionableCount),
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Hero card with gradient border */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card/60 to-brand/5">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-brand/5 blur-2xl" />

        <div className="relative p-6 sm:p-8 lg:p-10">
          {/* Top line */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 border border-brand/20 px-3 py-1 text-xs font-medium text-brand">
              <Zap className="h-3 w-3" />
              Audit complete
            </span>
            <span className="text-xs text-muted-foreground">
              {report.teamName} · {report.toolCount} tool
              {report.toolCount !== 1 ? "s" : ""} analyzed
            </span>
          </motion.div>

          {/* Main savings reveal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mb-8"
          >
            {hasSavings ? (
              <>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  You could save up to
                </p>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight gradient-text">
                    {formatCurrency(annualSavings)}
                  </span>
                  <span className="text-lg text-muted-foreground font-medium">
                    per year
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                    <ArrowDown className="h-3 w-3" />
                    {report.summary.savingsPercentage}% of total spend
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({formatCurrency(monthlySavings)}/mo)
                  </span>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-emerald-400 mb-2">
                  🎉 Great news!
                </p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Your AI spend is well-optimised
                </p>
                <p className="mt-2 text-muted-foreground text-sm">
                  We couldn&apos;t find significant savings opportunities — your
                  stack is lean.
                </p>
              </>
            )}
          </motion.div>

          {/* Metric cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
                className={`rounded-xl border p-4 ${
                  m.highlight
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-border/40 bg-card/40"
                }`}
              >
                <m.icon
                  className={`h-4 w-4 mb-2 ${
                    m.highlight ? "text-emerald-400" : "text-muted-foreground"
                  }`}
                />
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p
                  className={`mt-1 text-lg font-bold tracking-tight ${
                    m.highlight ? "text-emerald-400" : "text-foreground"
                  }`}
                >
                  {m.value}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Health score */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-6 flex items-center gap-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">
                Spend Health
              </span>
              <div className="relative w-32 h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${healthScore}%` }}
                  transition={{ delay: 1.0, duration: 0.8, ease: "easeOut" }}
                  className={`absolute inset-y-0 left-0 rounded-full ${
                    healthScore >= 80
                      ? "bg-emerald-500"
                      : healthScore >= 60
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                />
              </div>
              <span
                className={`text-sm font-bold ${
                  healthScore >= 80
                    ? "text-emerald-400"
                    : healthScore >= 60
                      ? "text-amber-400"
                      : "text-red-400"
                }`}
              >
                {healthScore}/100
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
