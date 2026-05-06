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
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://aispendaudit.com",
  ogImage: "/og-image.png",
  links: {
    github: "https://github.com/your-org/ai-spend-audit",
    twitter: "https://twitter.com/aispendaudit",
  },
};

// ─── Navigation ──────────────────────────────────────────────────────────────
export const navItems = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/blog" },
] as const;
