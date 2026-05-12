"use client";

/**
 * components/results/dashboard-skeleton.tsx
 * Skeleton loading states for the results dashboard.
 */
export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-10">
      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted/20 border border-border/50" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main content (left 2/3) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Health Score section */}
          <div className="h-64 rounded-2xl bg-muted/20 border border-border/50" />
          
          {/* Recommendations list */}
          <div className="space-y-4">
            <div className="h-8 w-48 bg-muted/20 rounded" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-muted/20 border border-border/50" />
            ))}
          </div>
        </div>

        {/* Sidebar (right 1/3) */}
        <div className="space-y-6">
          <div className="h-48 rounded-2xl bg-muted/20 border border-border/50" />
          <div className="h-96 rounded-2xl bg-muted/20 border border-border/50" />
        </div>
      </div>
    </div>
  );
}
