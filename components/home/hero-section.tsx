"use client";

/**
 * components/home/hero-section.tsx
 * Product Hunt-ready hero with dashboard preview and floating tool icons.
 */
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  MousePointerClick,
  MessageSquare,
  BookOpen,
  Sparkles,
  GitBranch,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay },
  }),
};

/* ── Floating tool icon positions ────────────────────────────────────────── */
const floatingIcons = [
  { Icon: MousePointerClick, label: "Cursor", x: "8%", y: "18%", delay: 0.8, color: "#7C3AED" },
  { Icon: GitBranch, label: "Copilot", x: "88%", y: "22%", delay: 1.0, color: "#238636" },
  { Icon: MessageSquare, label: "ChatGPT", x: "5%", y: "65%", delay: 1.2, color: "#10A37F" },
  { Icon: BookOpen, label: "Claude", x: "92%", y: "60%", delay: 0.9, color: "#D97757" },
  { Icon: Sparkles, label: "Gemini", x: "15%", y: "85%", delay: 1.1, color: "#4285F4" },
  { Icon: Wind, label: "Windsurf", x: "85%", y: "82%", delay: 1.3, color: "#06B6D4" },
];

/* ── Mock recommendation data ────────────────────────────────────────────── */
const mockRecommendations = [
  {
    tool: "Cursor",
    action: "Downgrade Business → Pro",
    savings: "$20/seat/mo",
    confidence: "High",
    icon: MousePointerClick,
    color: "#7C3AED",
  },
  {
    tool: "GitHub Copilot",
    action: "Remove 5 unused seats",
    savings: "$95/mo",
    confidence: "High",
    icon: GitBranch,
    color: "#238636",
  },
  {
    tool: "ChatGPT",
    action: "Switch Team → annual billing",
    savings: "$5/seat/mo",
    confidence: "Medium",
    icon: MessageSquare,
    color: "#10A37F",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(circle, oklch(0.97 0 0) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-brand/[0.04] blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[300px] w-[300px] rounded-full bg-emerald-500/[0.03] blur-3xl" />
      </div>

      {/* Floating tool icons (desktop only) */}
      <div className="hidden xl:block pointer-events-none absolute inset-0 -z-5" aria-hidden="true">
        {floatingIcons.map(({ Icon, label, x, y, delay, color }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ delay, duration: 0.8, ease: "easeOut" }}
            className="absolute"
            style={{ left: x, top: y }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/30 bg-card/30 backdrop-blur-sm">
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="container-page py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left: Copy ─────────────────────────────────────────── */}
          <div className="max-w-xl">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <Badge
                variant="outline"
                className="mb-6 gap-1.5 border-brand/20 bg-brand/[0.06] text-brand px-2.5 py-1 text-xs font-medium"
              >
                <DollarSign className="h-3 w-3" />
                Free · No login · 60 seconds
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.08}
              className="text-foreground text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.1]"
            >
              Your AI stack is
              <br />
              <span className="gradient-text">probably wasting money.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.16}
              className="mt-5 text-[17px] leading-relaxed text-muted-foreground max-w-lg"
            >
              Most startups overpay for AI tools — redundant seats, wrong plan tiers,
              monthly billing instead of annual. We find the waste and show you exactly
              how much you can save.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.24}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button
                nativeButton={false}
                size="lg"
                className="bg-brand hover:bg-brand/90 text-white shadow-lg shadow-brand/20 gap-2 h-11 px-5 text-[15px]"
                render={<Link href="/audit" />}
              >
                Audit my AI spend
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                nativeButton={false}
                size="lg"
                variant="outline"
                className="h-11 px-5 text-[15px] border-border/60"
                render={<Link href="/#sample-audit" />}
              >
                See a sample audit
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.32}
              className="mt-6 flex items-center gap-4 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                No OAuth needed
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Data stays local
              </span>
            </motion.div>
          </div>

          {/* ── Right: Dashboard Preview ───────────────────────────── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
            className="relative"
          >
            <div className="relative rounded-xl border border-border/40 bg-card/60 shadow-2xl shadow-black/30 ring-1 ring-white/[0.04] overflow-hidden">
              {/* Browser bar */}
              <div className="flex h-9 items-center gap-1.5 px-4 border-b border-border/40 bg-background/40">
                <span className="h-2 w-2 rounded-full bg-white/10" />
                <span className="h-2 w-2 rounded-full bg-white/10" />
                <span className="h-2 w-2 rounded-full bg-white/10" />
                <span className="ml-3 text-[11px] text-muted-foreground/60 font-mono">
                  aispendaudit.com/results
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* Savings hero strip */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border/30 bg-background/50 p-3.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">Monthly spend</p>
                    <p className="mt-1 text-xl font-bold tracking-tight text-foreground">$2,340</p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-3.5">
                    <p className="text-[10px] uppercase tracking-wider text-emerald-400/80 font-medium">Savings found</p>
                    <p className="mt-1 text-xl font-bold tracking-tight text-emerald-400">$840</p>
                  </div>
                  <div className="rounded-lg border border-border/30 bg-background/50 p-3.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">Health score</p>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <p className="text-xl font-bold tracking-tight text-amber-400">62</p>
                      <p className="text-[10px] text-muted-foreground/60">/100</p>
                    </div>
                  </div>
                </div>

                {/* Recommendation cards */}
                <div className="space-y-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                    Top recommendations
                  </p>
                  {mockRecommendations.map((rec) => (
                    <div
                      key={rec.tool}
                      className="flex items-center gap-3 rounded-lg border border-border/30 bg-background/40 p-3 hover:border-border/60 transition-colors"
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                        style={{ backgroundColor: `${rec.color}15` }}
                      >
                        <rec.icon className="h-4 w-4" style={{ color: rec.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-foreground truncate">{rec.tool}</p>
                          <span className={`shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                            rec.confidence === "High"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {rec.confidence}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground/70 truncate">{rec.action}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                          <TrendingDown className="h-3 w-3" />
                          {rec.savings}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between pt-2 border-t border-border/20">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
                    <AlertTriangle className="h-3 w-3" />
                    3 optimizations found
                  </div>
                  <div className="text-[10px] font-medium text-brand/70">
                    Save $10,080/yr →
                  </div>
                </div>
              </div>
            </div>

            {/* Glow behind card */}
            <div className="absolute -inset-4 -z-10 rounded-2xl bg-brand/[0.03] blur-2xl" aria-hidden="true" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
