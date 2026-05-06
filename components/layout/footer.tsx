/**
 * components/layout/footer.tsx
 * Site footer — minimal, Vercel-inspired.
 */
import Link from "next/link";
import { Zap } from "lucide-react";
import { siteConfig } from "@/config/site";

const footerLinks = [
  {
    heading: "Product",
    items: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Start Audit", href: "/audit" },
      { label: "Results", href: "/results" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container-page py-12 md:py-16">
        {/* Top row */}
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="space-y-3 max-w-xs">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand/10 ring-1 ring-brand/30">
                <Zap className="h-4 w-4 text-brand" />
              </span>
              <span className="font-semibold tracking-tight text-foreground">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerLinks.map((group) => (
              <div key={group.heading} className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {group.heading}
                </h4>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            {siteConfig.links.github && (
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </Link>
            )}
            {siteConfig.links.twitter && (
              <Link
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Twitter
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
