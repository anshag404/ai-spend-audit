/**
 * app/audit/page.tsx
 * Audit page — full spend input experience.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuditForm } from "@/components/audit/audit-form";

export const metadata: Metadata = {
  title: "Start Your AI Audit",
  description:
    "Enter your AI tool subscriptions and get a full spend analysis in under 60 seconds.",
};

export default function AuditPage() {
  return (
    <div className="container-page py-10 md:py-16">
      {/* Back link */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to home
      </Link>

      {/* Page header */}
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Audit your <span className="gradient-text">AI spend</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Select the AI tools your team uses, configure your plans and seats,
          and we&apos;ll analyse where you can save.
        </p>
      </div>

      {/* Form */}
      <AuditForm />
    </div>
  );
}
