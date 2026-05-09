"use client";

/**
 * components/results/results-dashboard.tsx
 * Main client-side results dashboard.
 *
 * Reads the audit report from localStorage (set by the audit form)
 * and renders all result sections with staggered animations.
 *
 * If no report is found, shows a friendly empty state directing
 * the user to run an audit first.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BarChart3, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuditReport } from "@/lib/engine/audit-types";
import { SavingsHero } from "./savings-hero";
import { RecommendationCard } from "./recommendation-card";
import { SpendChart } from "./spend-chart";
import { ToolBreakdown } from "./tool-breakdown";
import { AiSummary } from "./ai-summary";

type DashboardState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; report: AuditReport };

export function ResultsDashboard() {
  const [state, setState] = useState<DashboardState>({ status: "loading" });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("audit-report");
      if (!raw) {
        setState({ status: "empty" });
        return;
      }
      const report = JSON.parse(raw) as AuditReport;
      setState({ status: "ready", report });
    } catch {
      setState({ status: "empty" });
    }
  }, []);

  // ─── Loading state ──────────────────────────────────────────────────────
  if (state.status === "loading") {
    return (
      <div className="space-y-6">
        {/* Hero skeleton */}
        <div className="rounded-2xl border border-border/50 bg-card/40 p-8">
          <div className="space-y-4">
            <div className="h-4 w-32 rounded bg-muted/40 animate-shimmer" />
            <div className="h-10 w-64 rounded bg-muted/40 animate-shimmer delay-100" />
            <div className="h-4 w-48 rounded bg-muted/40 animate-shimmer delay-200" />
          </div>
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl border border-border/40 bg-card/40 animate-shimmer"
                style={{ animationDelay: `${200 + i * 100}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-xl border border-border/50 bg-card/40 animate-shimmer" />
          <div className="h-64 rounded-xl border border-border/50 bg-card/40 animate-shimmer delay-200" />
        </div>
      </div>
    );
  }

  // ─── Empty state ────────────────────────────────────────────────────────
  if (state.status === "empty") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center py-20"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 ring-1 ring-brand/30 mb-6">
          <BarChart3 className="h-8 w-8 text-brand" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">
          No audit results yet
        </h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Run your first audit to see a detailed spend breakdown, savings
          opportunities, and personalized recommendations.
        </p>
        <Button
          nativeButton={false}
          size="lg"
          className="bg-brand hover:bg-brand/90 text-white gap-2"
          render={<Link href="/audit" />}
        >
          Start your audit
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    );
  }

  // ─── Results dashboard ──────────────────────────────────────────────────
  const { report } = state;

  return (
    <div className="space-y-8">
      {/* Navigation bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          render={<Link href="/audit" />}
        >
          <RotateCcw className="h-3 w-3" />
          Run new audit
        </Button>
      </div>

      {/* 1. Savings hero — the headline "wow" moment */}
      <SavingsHero report={report} />

      {/* 2. AI-generated summary */}
      <AiSummary report={report} />

      {/* 3. Recommendations section */}
      {report.recommendations.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Recommendations
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {report.summary.actionableCount} actionable suggestion
              {report.summary.actionableCount !== 1 ? "s" : ""} · sorted by
              potential savings
            </p>
          </div>
          <div className="space-y-3">
            {report.recommendations.map((rec, i) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                index={i}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* 4. Side-by-side: spend chart + tool breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendChart spend={report.spend} />
        <ToolBreakdown tools={report.tools} />
      </div>

      {/* 5. Footer CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="flex flex-col items-center text-center py-10"
      >
        <p className="text-xs text-muted-foreground mb-4">
          Generated on{" "}
          {new Date(report.generatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <div className="flex gap-3">
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            render={<Link href="/audit" />}
          >
            <RotateCcw className="h-3 w-3" />
            Re-run with different data
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
