/**
 * app/results/page.tsx
 * Results page — premium audit dashboard.
 *
 * This is a server component shell that wraps the client-side
 * ResultsDashboard. The dashboard reads from localStorage so it
 * must be a client component, but we keep the metadata here.
 */
import type { Metadata } from "next";
import { ResultsDashboard } from "@/components/results/results-dashboard";

export const metadata: Metadata = {
  title: "Audit Results — Your AI Spend Report",
  description:
    "View your personalized AI spend audit — savings opportunities, tool-by-tool analysis, and actionable recommendations.",
};

export default function ResultsPage() {
  return (
    <div className="container-page py-8 md:py-12 lg:py-16">
      <ResultsDashboard />
    </div>
  );
}
