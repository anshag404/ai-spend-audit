/**
 * app/not-found.tsx
 * Custom 404 page.
 */
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page section flex flex-col items-center justify-center text-center">
      <p className="text-7xl font-bold tracking-tighter gradient-text mb-4">
        404
      </p>
      <h1 className="text-2xl font-semibold text-foreground">
        Page not found
      </h1>
      <p className="mt-3 text-muted-foreground max-w-sm">
        This page doesn&apos;t exist or has been moved. Let&apos;s get you back
        on track.
      </p>
      <div className="mt-8 flex gap-3">
        <Button nativeButton={false} render={<Link href="/" />} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Button>
        <Button nativeButton={false} variant="outline" render={<Link href="/audit" />}>
          Start an audit
        </Button>
      </div>
    </div>
  );
}
