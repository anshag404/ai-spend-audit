/**
 * config/site.ts
 * Central site configuration.
 * Import this wherever you need site-wide constants.
 */
import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: "AI Spend Audit",
  description:
    "Instantly analyse your team's AI tool subscriptions, detect redundant tools, and surface actionable savings. Built for lean startups.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-spend-audit-seven-lime.vercel.app",
  ogImage: "/og-image.png",
  links: {
    github: "https://github.com/anshag404/ai-spend-audit",
    twitter: "https://twitter.com/aispendaudit",
  },
};

// ─── Navigation ──────────────────────────────────────────────────────────────
export const navItems = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Supported Tools", href: "/#supported-tools" },
  { label: "Why Trust Us", href: "/#trust" },
  { label: "Sample Audit", href: "/#sample-audit" },
] as const;
