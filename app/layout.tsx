import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// ─── Fonts ──────────────────────────────────────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// ─── Site metadata ───────────────────────────────────────────────────────────
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aispendaudit.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI Spend Audit — Stop Overpaying for AI",
    template: "%s | AI Spend Audit",
  },
  description:
    "Instantly analyse your team's AI tool subscriptions, detect redundant tools, and surface actionable savings. Built for lean startups.",
  keywords: [
    "AI spend",
    "SaaS audit",
    "AI tools",
    "startup savings",
    "subscription management",
    "cost optimisation",
  ],
  authors: [{ name: "AI Spend Audit" }],
  creator: "AI Spend Audit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "AI Spend Audit",
    title: "AI Spend Audit — Stop Overpaying for AI",
    description:
      "Instantly analyse your team's AI tool subscriptions, detect redundant tools, and surface actionable savings.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Spend Audit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Spend Audit — Stop Overpaying for AI",
    description:
      "Instantly analyse your team's AI tool subscriptions and surface actionable savings.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
  width: "device-width",
  initialScale: 1,
};

import { PostHogProvider } from "@/components/providers/posthog-provider";

// ─── Layout ──────────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} dark h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <PostHogProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </PostHogProvider>
      </body>
    </html>
  );
}
