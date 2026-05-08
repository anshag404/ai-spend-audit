"use client";

/**
 * components/home/how-it-works-section.tsx
 * Three-step explainer section.
 */
import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import { ClipboardList, Cpu, TrendingDown } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "List your AI tools",
    description:
      "Paste in your team's AI and SaaS subscriptions — names, prices, team usage. Takes about two minutes.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "We analyse overlaps",
    description:
      "Our engine maps your stack against 500+ known AI tools, detects capability overlaps, and flags underutilised seats.",
  },
  {
    icon: TrendingDown,
    step: "03",
    title: "Get your savings report",
    description:
      "Receive a prioritised report with specific tools to cut, alternatives to consolidate onto, and the exact dollar savings.",
  },
];

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="border-t border-border/50"
    >
      <div className="container-page section">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">
            How it works
          </p>
          <h2 className="text-balance text-foreground">
            From spreadsheet to savings in 60 seconds
          </h2>
          <p className="mt-4 text-muted-foreground">
            No integrations. No OAuth dances. Just paste, analyse, save.
          </p>
        </div>

        {/* Steps */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8"
        >
          {steps.map(({ icon: Icon, step, title, description }) => (
            <motion.div key={step} variants={item}>
              <div className="relative rounded-xl border border-border/50 bg-card/40 p-6 h-full hover:border-brand/30 transition-colors group">
                {/* Step number */}
                <span className="absolute -top-3 left-6 text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
                  {step}
                </span>
                {/* Icon */}
                <div className="mb-4 mt-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand group-hover:bg-brand/20 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
