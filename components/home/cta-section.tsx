"use client";

/**
 * components/home/cta-section.tsx
 * Final conversion CTA before footer.
 */
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="border-t border-border/40">
      <div className="container-page py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl border border-brand/15 bg-brand/[0.03] px-8 py-16 sm:py-20 text-center"
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div className="h-60 w-60 rounded-full bg-brand/[0.06] blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Ready to find your savings?
            </h2>
            <p className="mt-4 max-w-md mx-auto text-muted-foreground">
              Takes 60 seconds. No sign-up required. You&apos;ll see exactly where
              your team is overspending — and how to fix it.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                nativeButton={false}
                size="lg"
                className="bg-brand hover:bg-brand/90 text-white shadow-lg shadow-brand/20 gap-2 h-11 px-6 text-[15px]"
                render={<Link href="/audit" />}
              >
                Audit my AI spend
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Free forever
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Results in 60 seconds
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
