"use client";

/**
 * components/home/cta-section.tsx
 * Final conversion CTA before footer.
 */
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="border-t border-border/50">
      <div className="container-page section">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl border border-brand/20 bg-brand/5 px-8 py-16 text-center"
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="text-balance text-foreground">
              Ready to reclaim your AI budget?
            </h2>
            <p className="mt-4 max-w-md mx-auto text-muted-foreground text-balance">
              Join 200+ startups that have already audited their AI stack and
              found an average of $3,400 in annual savings.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                nativeButton={false}
                size="lg"
                className="bg-brand hover:bg-brand/90 text-white shadow-lg shadow-brand/30 gap-2"
                render={<Link href="/audit" />}
              >
                Run your free audit
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground">
                Free · No credit card · 2 min setup
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
