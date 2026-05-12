"use client";

/**
 * components/home/sample-audit-section.tsx
 * Interactive product preview showing a realistic before/after audit.
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  TrendingDown,
  MousePointerClick,
  MessageSquare,
  BookOpen,
  GitBranch,
} from "lucide-react";

const auditItems = [
  {
    tool: "Cursor",
    icon: MousePointerClick,
    color: "#7C3AED",
    current: { plan: "Business", seats: 8, cost: "$320/mo" },
    optimized: { plan: "Pro", seats: 8, cost: "$160/mo" },
    savings: "$160/mo",
    annualSavings: "$1,920/yr",
    confidence: "High" as const,
    reasoning: "Business features (SSO, SAML) unused — your team is under 10 people.",
  },
  {
    tool: "ChatGPT",
    icon: MessageSquare,
    color: "#10A37F",
    current: { plan: "Team", seats: 12, cost: "$360/mo" },
    optimized: { plan: "Team (annual)", seats: 8, cost: "$200/mo" },
    savings: "$160/mo",
    annualSavings: "$1,920/yr",
    confidence: "High" as const,
    reasoning: "4 seats unused last month. Annual billing saves additional $60/yr per seat.",
  },
  {
    tool: "Claude Pro",
    icon: BookOpen,
    color: "#D97757",
    current: { plan: "Pro", seats: 6, cost: "$120/mo" },
    optimized: { plan: "Pro", seats: 3, cost: "$60/mo" },
    savings: "$60/mo",
    annualSavings: "$720/yr",
    confidence: "Medium" as const,
    reasoning: "3 team members also have ChatGPT Team — likely redundant for their use case.",
  },
  {
    tool: "GitHub Copilot",
    icon: GitBranch,
    color: "#238636",
    current: { plan: "Business", seats: 10, cost: "$190/mo" },
    optimized: { plan: "Pro", seats: 6, cost: "$60/mo" },
    savings: "$130/mo",
    annualSavings: "$1,560/yr",
    confidence: "High" as const,
    reasoning: "4 non-dev seats removed. Pro plan sufficient — no org policy features needed.",
  },
];

const totalMonthlySavings = 510;
const totalAnnualSavings = 6120;

export function SampleAuditSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="sample-audit" ref={ref} className="border-t border-border/40">
      <div className="container-page py-20 lg:py-24">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">
            Sample Audit
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Here&apos;s what a real audit looks like
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            A 12-person startup spending $990/mo across 4 AI tools.
            The audit found $510/mo in savings — that&apos;s $6,120/yr back in the budget.
          </p>
        </div>

        {/* Savings summary strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          {[
            { label: "Current spend", value: "$990/mo", sub: "$11,880/yr" },
            { label: "Optimized spend", value: "$480/mo", sub: "$5,760/yr", highlight: true },
            { label: "Monthly savings", value: `$${totalMonthlySavings}/mo`, savings: true },
            { label: "Annual savings", value: `$${totalAnnualSavings.toLocaleString()}/yr`, savings: true },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-lg border p-4 ${
                stat.savings
                  ? "border-emerald-500/20 bg-emerald-500/[0.05]"
                  : stat.highlight
                  ? "border-brand/20 bg-brand/[0.04]"
                  : "border-border/30 bg-card/40"
              }`}
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                {stat.label}
              </p>
              <p className={`mt-1 text-lg sm:text-xl font-bold tracking-tight ${
                stat.savings ? "text-emerald-400" : "text-foreground"
              }`}>
                {stat.value}
              </p>
              {stat.sub && (
                <p className="text-[11px] text-muted-foreground/50">{stat.sub}</p>
              )}
            </div>
          ))}
        </motion.div>

        {/* Recommendation cards */}
        <div className="space-y-3">
          {auditItems.map((item, i) => (
            <motion.div
              key={item.tool}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: "easeOut" }}
              className="group rounded-xl border border-border/30 bg-card/30 hover:border-border/60 transition-all"
            >
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Tool info */}
                  <div className="flex items-center gap-3 sm:w-44 shrink-0">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${item.color}12` }}
                    >
                      <item.icon className="h-4.5 w-4.5" style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.tool}</p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        item.confidence === "High"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {item.confidence} confidence
                      </span>
                    </div>
                  </div>

                  {/* Current → Optimized */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="flex-1 rounded-lg border border-border/20 bg-background/30 p-2.5 sm:p-3">
                      <p className="text-[10px] text-muted-foreground/60 font-medium">Current</p>
                      <p className="text-xs font-medium text-foreground mt-0.5">
                        {item.current.plan} · {item.current.seats} seats
                      </p>
                      <p className="text-xs text-muted-foreground/70">{item.current.cost}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    <div className="flex-1 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] p-2.5 sm:p-3">
                      <p className="text-[10px] text-emerald-400/70 font-medium">Optimized</p>
                      <p className="text-xs font-medium text-foreground mt-0.5">
                        {item.optimized.plan} · {item.optimized.seats} seats
                      </p>
                      <p className="text-xs text-emerald-400/90">{item.optimized.cost}</p>
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="sm:w-28 shrink-0 text-right sm:text-right">
                    <p className="text-sm font-bold text-emerald-400 flex items-center sm:justify-end gap-1">
                      <TrendingDown className="h-3.5 w-3.5" />
                      {item.savings}
                    </p>
                    <p className="text-[11px] text-muted-foreground/50">{item.annualSavings}</p>
                  </div>
                </div>

                {/* Reasoning */}
                <p className="mt-3 text-[12px] text-muted-foreground/60 leading-relaxed pl-12 sm:pl-[11.75rem]">
                  💡 {item.reasoning}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
