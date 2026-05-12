/**
 * app/page.tsx
 * Landing page — assembles home sections.
 */
import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { SupportedToolsSection } from "@/components/home/supported-tools-section";
import { SampleAuditSection } from "@/components/home/sample-audit-section";
import { TrustSection } from "@/components/home/trust-section";
import { CtaSection } from "@/components/home/cta-section";

export const metadata: Metadata = {
  title: "AI Spend Audit — Stop Overpaying for AI Tools",
  description:
    "Audit your startup's AI tool subscriptions in 60 seconds. Find redundant seats, wrong plan tiers, and overspending — free, no login required.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <SupportedToolsSection />
      <SampleAuditSection />
      <TrustSection />
      <CtaSection />
    </>
  );
}
