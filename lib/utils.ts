/**
 * lib/utils.ts
 * Core utility helpers used across the entire application.
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Class name helper ───────────────────────────────────────────────────────
/**
 * Merges Tailwind class names safely, resolving conflicts.
 * Usage: cn("px-4 py-2", isActive && "bg-brand", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Formatting ──────────────────────────────────────────────────────────────
/**
 * Format a number as USD currency.
 * formatCurrency(1234.5) → "$1,234.50"
 */
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a large number with compact suffix.
 * formatCompact(12500) → "12.5K"
 */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

// ─── Date helpers ────────────────────────────────────────────────────────────
/**
 * Return a human-readable relative date string.
 * relativeTime(new Date(Date.now() - 60_000)) → "1 minute ago"
 */
export function relativeTime(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, seconds] of units) {
    if (Math.abs(diff) >= seconds) {
      return rtf.format(-Math.round(diff / seconds), unit);
    }
  }
  return "just now";
}

// ─── String helpers ──────────────────────────────────────────────────────────
/**
 * Truncate a string to `maxLength` chars, appending "…" if needed.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

/**
 * Convert a string to a URL-safe slug.
 * toSlug("Hello World!") → "hello-world"
 */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Capitalise the first letter of a string.
 */
export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Async helpers ───────────────────────────────────────────────────────────
/**
 * Sleep for a given number of milliseconds.
 * Useful for rate-limiting and artificial delays in dev.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Environment helpers ─────────────────────────────────────────────────────
/** Returns true if the app is running on the server. */
export const isServer = typeof window === "undefined";

/** Returns true if the app is running in a browser. */
export const isClient = !isServer;

/** Returns true when NODE_ENV is "production". */
export const isProd = process.env.NODE_ENV === "production";
