/**
 * types/index.ts
 * Shared application-level TypeScript types.
 * Extend these as features are built across Days 2–7.
 */

// ─── Navigation ──────────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  badge?: string;
}

// ─── Site config ─────────────────────────────────────────────────────────────
export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    github?: string;
    twitter?: string;
  };
}

// ─── Audit (stub — expanded on Day 3) ───────────────────────────────────────
export type AuditStatus = "idle" | "running" | "complete" | "error";

export interface AuditResult {
  id: string;
  createdAt: string;
  status: AuditStatus;
  totalSpend: number;
  potentialSavings: number;
  toolCount: number;
}
