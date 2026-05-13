/**
 * lib/db/leads.ts
 * Database helper functions for the leads table.
 *
 * Privacy model:
 * - Leads stored SEPARATELY from audits (GDPR erasure = delete this row only)
 * - Duplicate email+audit_id check before inserting
 * - IP hash stored for rate-limit lookups only
 */
import { getAdminClient } from "@/lib/supabase/admin";
import type { LeadRow } from "@/types/database";
import { hashIp } from "@/lib/utils/rate-limit";
import { markAuditHasLead } from "./audits";

export interface CaptureleadOptions {
  auditId: string;
  email: string;
  ipAddress: string | null;
  source?: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
}

export interface CaptureLeadResult {
  lead: LeadRow | null;
  error?: string;
  isDuplicate?: boolean;
}

export async function captureLead({
  auditId,
  email,
  ipAddress,
  source = "share-modal",
  companyName,
  role,
  teamSize,
}: CaptureleadOptions): Promise<CaptureLeadResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getAdminClient() as any;
  const normalizedEmail = email.toLowerCase().trim();
  const ipHash = ipAddress ? await hashIp(ipAddress) : null;

  // ── Duplicate check ───────────────────────────────────────────────────────
  const { data: existing } = await db
    .from("leads")
    .select("id")
    .eq("audit_id", auditId)
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existing) {
    return { lead: null, isDuplicate: true };
  }

  // ── Insert lead ───────────────────────────────────────────────────────────
  const { data, error } = await db
    .from("leads")
    .insert({
      audit_id: auditId,
      email: normalizedEmail,
      email_status: "pending",
      resend_message_id: null,
      source,
      ip_hash: ipHash,
      company_name: companyName ?? null,
      role: role ?? null,
      team_size: teamSize ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[captureLead] DB error:", error);
    return { lead: null, error: error?.message ?? "Failed to save" };
  }

  await markAuditHasLead(auditId);

  return { lead: data as LeadRow };
}

export async function updateLeadEmailStatus(
  leadId: string,
  status: "sent" | "failed",
  resendMessageId?: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getAdminClient() as any;
  await db
    .from("leads")
    .update({
      email_status: status,
      resend_message_id: resendMessageId ?? null,
    })
    .eq("id", leadId);
}
