/**
 * app/results/page.tsx
 * Results page — placeholder for Day 4+ dashboard.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Audit Results",
  description:
    "View your AI spend audit results — detected savings, redundant tools, and actionable recommendations.",
};

export default function ResultsPage() {
  return (
    <div className="container-page section flex flex-col items-center text-center">
      {/* Back */}
      <Link
        href="/"
        className="mb-10 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to home
      </Link>

      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 ring-1 ring-brand/30 mb-6">
        <BarChart3 className="h-8 w-8 text-brand" />
      </div>

      {/* Heading */}
      <h1 className="max-w-xl text-balance">
        Your <span className="gradient-text">audit results</span>
      </h1>
      <p className="mt-4 max-w-lg text-muted-foreground text-balance">
        Your results dashboard is coming soon. Once you run an audit,
        you&apos;ll see a full spend breakdown, recommended cuts, and a
        share-ready report here.
      </p>

      {/* Mock stat cards */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl opacity-40 pointer-events-none select-none">
        {[
          { label: "Monthly spend", value: "—" },
          { label: "Potential savings", value: "—" },
          { label: "Redundant tools", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/50 bg-card/40 p-5 text-left"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        (Greyed out — data shown after you run an audit)
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button
          nativeButton={false}
          size="lg"
          className="bg-brand hover:bg-brand/90 text-white"
          render={<Link href="/audit" />}
        >
          Run your first audit
        </Button>
        <Button
          nativeButton={false}
          size="lg"
          variant="outline"
          render={<Link href="/" />}
        >
          Back to home
        </Button>
      </div>


    </div>
  );
}
