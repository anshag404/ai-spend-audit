/**
 * app/page.tsx
 * Landing page — assembles home sections.
 */
import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { CtaSection } from "@/components/home/cta-section";

export const metadata: Metadata = {
  title: "AI Spend Audit — Stop Overpaying for AI",
  description:
    "Instantly analyse your team's AI tool subscriptions, detect redundant tools, and surface actionable savings in under 60 seconds.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <CtaSection />
    </>
  );
}
