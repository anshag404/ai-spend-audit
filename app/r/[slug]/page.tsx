/**
 * app/r/[slug]/page.tsx
 * Public share page — /r/[slug]
 *
 * Security / privacy model:
 * - ONLY data from audits.public_snapshot is rendered here.
 * - The snapshot was sanitized at write-time by buildPublicSnapshot().
 * - No emails, no company names, no team names ever appear here.
 * - The team name is replaced with a generic "This team" label.
 *
 * OG metadata:
 * - Dynamic title/description/image based on the audit data.
 * - Twitter card support for viral sharing.
 * - Canonical URL set for SEO.
 *
 * View counting:
 * - Handled inside getPublicAudit() via a Supabase RPC call.
 * - Fire-and-forget so it doesn't slow page render.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicAudit } from "@/lib/db/audits";
import { PublicReportView } from "@/components/share/public-report-view";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── Dynamic OG metadata ──────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { snapshot } = await getPublicAudit(slug);

  if (!snapshot) {
    return { title: "Report not found — AI Spend Audit" };
  }

  const hasSavings = snapshot.annualSavings > 0;
  const title = hasSavings
    ? `AI Stack Audit: $${snapshot.annualSavings.toLocaleString()}/yr savings found`
    : `AI Stack Audit: ${snapshot.healthScore}/100 spend health score`;

  const description = hasSavings
    ? `${snapshot.toolCount} AI tools audited. Found ${snapshot.savingsPercentage}% of spend that could be optimised. See how your team compares.`
    : `${snapshot.toolCount} AI tools audited with a health score of ${snapshot.healthScore}/100. See how your team's spend compares.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aispendaudit.com";
  const canonical = `${siteUrl}/r/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "AI Spend Audit",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@AISpendAudit",
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function SharePage({ params }: PageProps) {
  const { slug } = await params;
  const { audit, snapshot } = await getPublicAudit(slug);

  if (!audit || !snapshot) {
    notFound();
  }

  return (
    <div className="container-page py-8 md:py-12">
      <PublicReportView
        slug={slug}
        snapshot={snapshot}
        createdAt={audit.created_at}
        viewCount={audit.view_count}
      />
    </div>
  );
}
