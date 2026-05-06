/**
 * app/audit/page.tsx
 * Audit initiation page — placeholder for Day 2+ form.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Start Your AI Audit",
  description:
    "Enter your AI tool subscriptions and get a full spend analysis in under 60 seconds.",
};

export default function AuditPage() {
  return (
    <div className="container-page section flex flex-col items-center text-center">
      {/* Back link */}
      <Link
        href="/"
        className="mb-10 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to home
      </Link>

      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 ring-1 ring-brand/30 mb-6">
        <FileSearch className="h-8 w-8 text-brand" />
      </div>

      {/* Heading */}
      <h1 className="max-w-xl text-balance">
        Start your <span className="gradient-text">free audit</span>
      </h1>
      <p className="mt-4 max-w-lg text-muted-foreground text-balance">
        We&apos;re putting the finishing touches on the audit form.
        Check back soon!
      </p>

      {/* Placeholder CTA */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button
          size="lg"
          disabled
          className="bg-brand text-white opacity-60 cursor-not-allowed"
        >
          Audit form coming soon
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
