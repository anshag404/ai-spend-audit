"use client";

/**
 * components/share/public-report-view.tsx
 * The public-facing share page UI.
 *
 * Design principles:
 * - Clean, viral, screenshot-worthy
 * - "This team" replaces any company name (privacy by design)
 * - Shows enough data to be impressive, but gates full details behind
 *   "Run your own audit" CTA
 * - Includes share/copy buttons to drive viral loop
 */
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  TrendingDown,
  BarChart3,
  Copy,
  Check,
  ExternalLink,
  Eye,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { PublicAuditSnapshot } from "@/types/database";

interface PublicReportViewProps {
  slug: string;
  snapshot: PublicAuditSnapshot;
  createdAt: string;
  viewCount: number;
}

const CONFIDENCE_COLORS = {
  high: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-muted-foreground bg-muted/20 border-border/30",
};

export function PublicReportView({
  slug,
  snapshot,
  createdAt,
  viewCount,
}: PublicReportViewProps) {
  const [copied, setCopied] = useState(false);
  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://aispendaudit.com";
  const shareUrl = `${siteUrl}/r/${slug}`;
  const hasSavings = snapshot.annualSavings > 0;

  const tweetText = hasSavings
    ? `This team's AI stack could save $${snapshot.annualSavings.toLocaleString()}/yr. See the full breakdown 👇`
    : `This team's AI spend health score: ${snapshot.healthScore}/100. See how yours compares 👇`;

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-semibold text-brand"
        >
          <Zap className="h-3.5 w-3.5" />
          AI Spend Audit
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" />
          {viewCount + 1} view{viewCount !== 0 ? "s" : ""}
        </div>
      </div>

      {/* Main hero card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card/60 to-brand/5 p-6 sm:p-8"
      >
        {/* Glow */}
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-brand/10 blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 border border-brand/20 px-3 py-1 text-xs font-medium text-brand">
            <Zap className="h-3 w-3" />
            AI Spend Audit Report
          </span>
          <span className="text-xs text-muted-foreground">
            {snapshot.toolCount} tool{snapshot.toolCount !== 1 ? "s" : ""} · {snapshot.teamSize} person team
          </span>
        </div>

        {/* Headline */}
        {hasSavings ? (
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-2">
              This team could save up to
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight gradient-text">
                {formatCurrency(snapshot.annualSavings)}
              </span>
              <span className="text-lg text-muted-foreground">per year</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                <TrendingDown className="h-3 w-3" />
                {snapshot.savingsPercentage}% of total spend
              </span>
              <span className="text-xs text-muted-foreground">
                ({formatCurrency(snapshot.monthlySavings)}/mo)
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <p className="text-sm text-emerald-400 mb-2">🎉 Well-optimised stack</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              This team's AI spend is lean
            </p>
          </div>
        )}

        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Monthly spend",
              value: formatCurrency(snapshot.totalMonthly),
              icon: BarChart3,
            },
            {
              label: "Monthly savings",
              value: formatCurrency(snapshot.monthlySavings),
              icon: TrendingDown,
              highlight: hasSavings,
            },
            {
              label: "Health score",
              value: `${snapshot.healthScore}/100`,
              icon: Zap,
            },
            {
              label: "Recommendations",
              value: String(snapshot.actionableCount),
              icon: ArrowRight,
            },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.07, duration: 0.3 }}
              className={`rounded-xl border p-3 ${
                m.highlight
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-border/40 bg-card/40"
              }`}
            >
              <m.icon
                className={`h-3.5 w-3.5 mb-2 ${m.highlight ? "text-emerald-400" : "text-muted-foreground"}`}
              />
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <p
                className={`text-base font-bold mt-0.5 ${m.highlight ? "text-emerald-400" : "text-foreground"}`}
              >
                {m.value}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Top recommendations */}
      {snapshot.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Top Recommendations
          </h2>
          <div className="space-y-2">
            {snapshot.recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }}
                className="flex items-center justify-between rounded-lg border border-border/40 bg-card/30 px-4 py-3 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex-shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                      CONFIDENCE_COLORS[rec.confidence]
                    }`}
                  >
                    {rec.confidence}
                  </span>
                  <p className="text-xs text-foreground truncate">{rec.title}</p>
                </div>
                {rec.annualSavings > 0 && (
                  <span className="text-xs font-semibold text-emerald-400 flex-shrink-0">
                    {formatCurrency(rec.annualSavings)}/yr
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tool breakdown */}
      {snapshot.toolBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Spend Distribution
          </h2>
          <div className="space-y-2.5">
            {snapshot.toolBreakdown.map((tool) => (
              <div key={tool.toolName} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">
                    {tool.toolName}
                  </span>
                  <span className="text-muted-foreground">
                    {tool.percentOfTotal}% · {formatCurrency(tool.monthlyCost)}/mo
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tool.percentOfTotal}%` }}
                    transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-brand/60"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Share row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="flex items-center gap-2 flex-wrap"
      >
        <button
          id="copy-public-link"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/10 hover:bg-muted/30 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy link"}
        </button>
        <a
          id="share-on-twitter-public"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/10 hover:bg-sky-500/10 hover:border-sky-500/20 px-3 py-2 text-xs text-muted-foreground hover:text-sky-400 transition-colors"
        >
          <span className="font-bold">𝕏</span>
          Tweet this
        </a>
        <a
          id="share-on-linkedin-public"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/10 hover:bg-[#0A66C2]/10 px-3 py-2 text-xs text-muted-foreground hover:text-[#0A66C2] transition-colors"
        >
          <span className="font-bold text-xs">in</span>
          Share
        </a>
      </motion.div>

      {/* CTA — viral loop */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="rounded-xl border border-brand/20 bg-gradient-to-r from-brand/5 to-transparent p-5 text-center"
      >
        <p className="text-sm font-semibold text-foreground mb-1">
          Curious about your own AI spend?
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Run a free audit in under 2 minutes. No signup required.
        </p>
        <Button
          nativeButton={false}
          className="bg-brand hover:bg-brand/90 text-white gap-2 text-sm"
          render={<Link href="/audit" />}
        >
          Run my free audit
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </motion.div>

      {/* Audit date footer */}
      <p className="text-center text-[10px] text-muted-foreground/50 pb-4">
        Audit generated{" "}
        {new Date(createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        · <a href={shareUrl} className="hover:underline"><ExternalLink className="inline h-2.5 w-2.5" /> {shareUrl}</a>
      </p>
    </div>
  );
}
