"use client";

/**
 * components/layout/navbar.tsx
 * Lightweight, startup-focused navigation.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navItems, siteConfig } from "@/config/site";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container-page flex h-14 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand/10 ring-1 ring-brand/30 group-hover:ring-brand/50 transition-all">
            <Zap className="h-3.5 w-3.5 text-brand" />
          </span>
          <span className="font-semibold tracking-tight text-foreground text-sm">
            {siteConfig.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors",
                pathname === item.href
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/#sample-audit"
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            View Sample Audit
          </Link>
          <Button
            nativeButton={false}
            size="sm"
            className="bg-brand hover:bg-brand/90 text-white gap-1.5 text-[13px] h-8 px-3"
            render={<Link href="/audit" />}
          >
            Audit My AI Spend
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="container-page py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3 mt-1 border-t border-border/40 flex flex-col gap-2">
                <Button
                  nativeButton={false}
                  variant="outline"
                  className="w-full text-sm"
                  render={<Link href="/#sample-audit" onClick={() => setMobileOpen(false)} />}
                >
                  View Sample Audit
                </Button>
                <Button
                  nativeButton={false}
                  className="w-full bg-brand hover:bg-brand/90 text-white gap-1.5 text-sm"
                  render={<Link href="/audit" onClick={() => setMobileOpen(false)} />}
                >
                  Audit My AI Spend
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
