/**
 * lib/email/resend.ts
 * Transactional email sending via Resend.
 *
 * Emails we send:
 * 1. "Your audit report is ready" — sent when a lead captures their email
 *    Links back to their share page with their full summary.
 *
 * Graceful degradation:
 * - If RESEND_API_KEY is not configured, we skip sending and log a warning.
 * - The lead capture still succeeds — email is stored as "failed" status.
 * - This means the product works without email configured (dev / early users).
 */
import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

export interface SendAuditReportEmailOptions {
  to: string;
  shareUrl: string;
  annualSavings: number;
  toolCount: number;
  healthScore: number;
}

export interface SendEmailResult {
  messageId: string | null;
  error?: string;
}

export async function sendAuditReportEmail({
  to,
  shareUrl,
  annualSavings,
  toolCount,
  healthScore,
}: SendAuditReportEmailOptions): Promise<SendEmailResult> {
  const resend = getResend();

  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured — skipping email send");
    return { messageId: null, error: "Email not configured" };
  }

  const fromDomain = process.env.RESEND_FROM_DOMAIN ?? "onboarding@resend.dev";
  const hasSavings = annualSavings > 0;

  try {
    const { data, error } = await resend.emails.send({
      from: `AI Spend Audit <${fromDomain}>`,
      to: [to],
      subject: hasSavings
        ? `Your AI stack could save $${annualSavings.toLocaleString()}/year`
        : `Your AI spend audit is ready`,
      html: buildEmailHtml({
        shareUrl,
        annualSavings,
        toolCount,
        healthScore,
        hasSavings,
      }),
    });

    if (error || !data) {
      console.error("[email] Resend error:", error);
      return { messageId: null, error: error?.message };
    }

    return { messageId: data.id };
  } catch (err) {
    console.error("[email] Unexpected error:", err);
    return { messageId: null, error: "Send failed" };
  }
}

// ─── Email HTML template ──────────────────────────────────────────────────────
function buildEmailHtml({
  shareUrl,
  annualSavings,
  toolCount,
  healthScore,
  hasSavings,
}: {
  shareUrl: string;
  annualSavings: number;
  toolCount: number;
  healthScore: number;
  hasSavings: boolean;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Your AI Spend Audit</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <!-- Logo -->
    <div style="margin-bottom:32px;">
      <span style="display:inline-flex;align-items:center;gap:8px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:8px;padding:8px 14px;">
        <span style="color:#818cf8;font-size:16px;">⚡</span>
        <span style="color:#818cf8;font-weight:700;font-size:14px;letter-spacing:-0.01em;">AI Spend Audit</span>
      </span>
    </div>

    <!-- Headline -->
    <h1 style="color:#f8fafc;font-size:28px;font-weight:800;line-height:1.2;margin:0 0 12px;">
      ${hasSavings
        ? `Your AI stack could save <span style="color:#818cf8;">$${annualSavings.toLocaleString()}/year</span>`
        : "Your AI spend audit is ready"
      }
    </h1>
    <p style="color:#94a3b8;font-size:16px;line-height:1.6;margin:0 0 32px;">
      We've analysed your ${toolCount} AI tool${toolCount !== 1 ? "s" : ""} and generated a personalised report.
      Your spend health score is <strong style="color:#f8fafc;">${healthScore}/100</strong>.
    </p>

    <!-- CTA -->
    <a href="${shareUrl}" style="display:inline-block;background:#6366f1;color:#fff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:10px;letter-spacing:-0.01em;">
      View your full report →
    </a>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:40px 0;" />

    <!-- Footer -->
    <p style="color:#475569;font-size:12px;line-height:1.5;margin:0;">
      You're receiving this because you requested your AI spend audit.
      This link is yours — feel free to share it with your team.<br /><br />
      <a href="${shareUrl}" style="color:#6366f1;text-decoration:none;">${shareUrl}</a>
    </p>
  </div>
</body>
</html>
`;
}
