"use client";

/**
 * components/results/share-panel.tsx
 * Share button + lead capture modal for the results page.
 *
 * Flow:
 * 1. User clicks "Share results" → modal opens
 * 2. Email form shown → on submit, we POST /api/leads/capture
 * 3. On success, show the share URL with copy button
 * 4. Copy/Twitter/LinkedIn share options
 *
 * The share URL (/r/[slug]) is generated when the audit is saved to DB.
 * The `auditId` and `shareSlug` are passed in as props from the results
 * dashboard which already called /api/audit/save after the audit ran.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  X,
  Copy,
  Check,
  Mail,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SharePanelProps {
  auditId: string;
  shareUrl: string;
  annualSavings: number;
  healthScore: number;
}

type ModalStep = "email" | "success";

export function SharePanel({
  auditId,
  shareUrl,
  annualSavings,
  healthScore,
}: SharePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>("email");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const hasSavings = annualSavings > 0;
  const tweetText = hasSavings
    ? `Just audited my team's AI spending. Found $${annualSavings.toLocaleString()}/yr in savings with @AISpendAudit. Your turn 👇`
    : `Just got my AI spend health score: ${healthScore}/100 with @AISpendAudit. See how your team compares 👇`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          email,
          source: "share-modal",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStep("success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <>
      {/* Share button */}
      <Button
        id="share-results-btn"
        onClick={() => setIsOpen(true)}
        size="sm"
        className="gap-1.5 text-xs bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20"
        variant="ghost"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share results
      </Button>

      {/* Modal backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border/40">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Share your results
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Get a private link to your report
                  </p>
                </div>
                <button
                  id="close-share-modal"
                  onClick={() => setIsOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="p-5">
                <AnimatePresence mode="wait">
                  {/* ── Step 1: Email capture ─────────────────────────────────── */}
                  {step === "email" && (
                    <motion.div
                      key="email-step"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Value prop */}
                      <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 mb-5">
                        <div className="flex items-start gap-3">
                          <Mail className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-foreground">
                              Get your report by email
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              Enter your email to get a link to your full report
                              — plus we'll send you a shareable version you can
                              forward to your team.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Email form */}
                      <form onSubmit={handleEmailSubmit} className="space-y-3">
                        <div>
                          <label
                            htmlFor="share-email-input"
                            className="block text-xs font-medium text-foreground mb-1.5"
                          >
                            Work email
                          </label>
                          <input
                            id="share-email-input"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="w-full rounded-lg border border-border/50 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-colors"
                          />
                        </div>

                        {error && (
                          <p className="text-xs text-red-400">{error}</p>
                        )}

                        <Button
                          id="submit-share-email"
                          type="submit"
                          className="w-full bg-brand hover:bg-brand/90 text-white gap-2"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Mail className="h-3.5 w-3.5" />
                              Get my report link
                            </>
                          )}
                        </Button>

                        <p className="text-[10px] text-muted-foreground text-center">
                          No spam. Unsubscribe anytime. We never sell your data.
                        </p>
                      </form>
                    </motion.div>
                  )}

                  {/* ── Step 2: Success + share ───────────────────────────────── */}
                  {step === "success" && (
                    <motion.div
                      key="success-step"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      {/* Success message */}
                      <div className="text-center py-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 mx-auto mb-3">
                          <Check className="h-5 w-5 text-emerald-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">
                          Report link ready!
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          We've emailed you the link. Here it is to share now:
                        </p>
                      </div>

                      {/* Copy URL */}
                      <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 p-2">
                        <p className="flex-1 text-xs text-muted-foreground truncate px-1 font-mono">
                          {shareUrl}
                        </p>
                        <button
                          id="copy-share-url"
                          onClick={handleCopy}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-brand/10 hover:bg-brand/20 text-brand transition-colors flex-shrink-0"
                          title="Copy link"
                        >
                          {copied ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Share buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          id="copy-link-btn"
                          onClick={handleCopy}
                          className="flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/30 p-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="text-[10px]">
                            {copied ? "Copied!" : "Copy link"}
                          </span>
                        </button>

                        <a
                          id="share-twitter-btn"
                          href={twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-muted/10 hover:bg-sky-500/10 hover:border-sky-500/20 p-3 text-muted-foreground hover:text-sky-400 transition-colors"
                        >
                          <span className="text-sm font-bold">𝕏</span>
                          <span className="text-[10px]">Twitter / X</span>
                        </a>

                        <a
                          id="share-linkedin-btn"
                          href={linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-muted/10 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/20 p-3 text-muted-foreground hover:text-[#0A66C2] transition-colors"
                        >
                          <span className="text-xs font-bold">in</span>
                          <span className="text-[10px]">LinkedIn</span>
                        </a>
                      </div>

                      {/* Open in new tab */}
                      <a
                        id="open-share-page"
                        href={shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open share page
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
