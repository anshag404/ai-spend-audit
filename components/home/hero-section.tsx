"use client";

/**
 * components/home/hero-section.tsx
 */
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay },
  }),
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, oklch(0.97 0 0) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-brand/5 blur-3xl" />
      </div>

      <div className="container-page section flex flex-col items-center text-center">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <Badge
            variant="outline"
            className="mb-6 gap-1.5 border-brand/30 bg-brand/5 text-brand hover:bg-brand/10 px-3 py-1 text-xs font-medium"
          >
            <Sparkles className="h-3 w-3" />
            Free for startups · No credit card
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="max-w-4xl text-balance text-foreground"
        >
          Stop overpaying for{" "}
          <span className="gradient-text">AI tools</span>
          <br className="hidden sm:block" /> your team barely uses
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.2}
          className="mt-6 max-w-2xl text-lg text-muted-foreground text-balance"
        >
          Select your team's AI subscriptions, and we surface redundant tools,
          usage gaps, and concrete savings — in under 60 seconds.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.3}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            nativeButton={false}
            size="lg"
            className="bg-brand hover:bg-brand/90 text-white shadow-lg shadow-brand/25 gap-2"
            render={<Link href="/audit" />}
          >
            Start free audit
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            nativeButton={false}
            size="lg"
            variant="outline"
            render={<Link href="/#how-it-works" />}
          >
            See how it works
          </Button>
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.4}
          className="mt-6 text-xs text-muted-foreground"
        >
          Built for{" "}
          <span className="font-semibold text-foreground">early-stage startups</span>{" "}
          · No login required · Average savings{" "}
          <span className="font-semibold text-foreground">$3,400/yr</span>
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.5}
          className="mt-16 w-full max-w-4xl"
        >
          <div className="relative rounded-xl border border-border/50 bg-card/50 p-1 shadow-2xl shadow-black/40 ring-1 ring-white/5">
            <div className="flex h-8 items-center gap-1.5 px-3 border-b border-border/50">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              <span className="ml-4 text-xs text-muted-foreground font-mono">
                aispendaudit.com/results
              </span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Monthly spend", value: "$8,420" },
                { label: "Potential savings", value: "$3,140" },
                { label: "Redundant tools", value: "7" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border/50 bg-background/60 p-4">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
                </div>
              ))}
              <div className="sm:col-span-3 rounded-lg border border-border/50 bg-background/60 p-4 h-32 flex items-end gap-2">
                {[65, 45, 80, 30, 90, 55, 70, 40, 85, 60, 75, 50].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-brand/30" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
