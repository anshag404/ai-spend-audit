"use client";

/**
 * components/home/trust-section.tsx
 * Trust, credibility, and security messaging.
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Shield,
  Database,
  Calculator,
  Target,
  Lock,
  Eye,
  Users,
  Lightbulb,
} from "lucide-react";

/* ── Why Trust This Audit ────────────────────────────────────────────────── */
const trustPoints = [
  {
    icon: Database,
    title: "Real pricing data",
    description:
      "Every plan tier and seat price comes directly from each vendor's official pricing page. No guessing.",
  },
  {
    icon: Calculator,
    title: "Deterministic logic",
    description:
      "Recommendations are produced by rule-based financial math — not AI predictions. Every number is verifiable.",
  },
  {
    icon: Target,
    title: "Startup-specific rules",
    description:
      "Our engine understands that a 5-person team doesn't need enterprise SSO. Recommendations match your stage.",
  },
  {
    icon: Shield,
    title: "No hidden agenda",
    description:
      "We don't take referral fees from any AI vendor. Recommendations are purely based on your spend data.",
  },
];

/* ── Built For ───────────────────────────────────────────────────────────── */
const personas = [
  {
    icon: Users,
    title: "Engineering leads",
    pain: "Managing 10+ AI subscriptions across the team with no visibility into actual usage.",
  },
  {
    icon: Lightbulb,
    title: "Startup founders",
    pain: "Every dev added their own ChatGPT, Cursor, and Claude seats. Now it's $800/mo and nobody knows why.",
  },
  {
    icon: Target,
    title: "Indie hackers",
    pain: "Paying for ChatGPT Pro ($200/mo) because it felt premium, but Plus would cover 99% of use cases.",
  },
];

/* ── Privacy ─────────────────────────────────────────────────────────────── */
const privacyPoints = [
  { icon: Lock, text: "No OAuth or account connections — we never access your AI accounts" },
  { icon: Eye, text: "Spend data stays in your browser until you choose to save or share" },
  { icon: Shield, text: "IP addresses are hashed, never stored raw — we can't identify you" },
  { icon: Database, text: "Open methodology — every recommendation traces to a specific rule" },
];

export function TrustSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="trust" ref={ref} className="border-t border-border/40">
      <div className="container-page py-20 lg:py-24 space-y-20">
        {/* ── Why Trust This Audit ──────────────────────────────────── */}
        <div>
          <div className="mx-auto max-w-2xl text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">
              Credibility
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Why trust this audit?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Financial recommendations need to be bulletproof. Here&apos;s how we ensure every
              suggestion is accurate and actionable.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {trustPoints.map((point, i) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
                className="flex gap-4 rounded-xl border border-border/30 bg-card/30 p-5 hover:border-border/50 transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/[0.07]">
                  <point.icon className="h-4.5 w-4.5 text-brand" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{point.title}</h3>
                  <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Built For Startup Teams ──────────────────────────────── */}
        <div>
          <div className="mx-auto max-w-2xl text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">
              Built For
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Built for startup teams
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              If your team has been stacking AI subscriptions without a system,
              you&apos;re not alone. This is the problem we solve.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {personas.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: "easeOut" }}
                className="rounded-xl border border-border/30 bg-card/30 p-5 hover:border-border/50 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/[0.07] mb-3">
                  <p.icon className="h-4.5 w-4.5 text-brand" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
                  &ldquo;{p.pain}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Privacy & Security ───────────────────────────────────── */}
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-border/30 bg-card/20 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/[0.08]">
                <Lock className="h-4.5 w-4.5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Privacy &amp; Security</h3>
            </div>
            <div className="space-y-3">
              {privacyPoints.map((point) => (
                <div key={point.text} className="flex items-start gap-3">
                  <point.icon className="h-4 w-4 text-emerald-400/60 mt-0.5 shrink-0" />
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{point.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
