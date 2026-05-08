/**
 * lib/schemas/audit-schema.ts
 * Zod validation schemas for the audit form.
 */
import { z } from "zod/v4";

// ─── Single tool entry ──────────────────────────────────────────────────────
export const auditToolEntrySchema = z.object({
  toolId: z.string().min(1, "Please select a tool"),
  planId: z.string().min(1, "Please select a plan"),
  billingCycle: z.enum(["monthly", "annual"]),
  seats: z
    .number({ error: "Enter a valid number" })
    .int("Must be a whole number")
    .min(1, "At least 1 seat required")
    .max(10000, "That seems too high"),
  monthlySpend: z
    .number({ error: "Enter a valid amount" })
    .min(0, "Spend cannot be negative")
    .max(1_000_000, "That seems too high"),
  useCase: z.enum([
    "code-generation",
    "code-review",
    "chat-support",
    "content-writing",
    "data-analysis",
    "internal-tools",
    "customer-facing",
    "research",
    "other",
  ]),
  notes: z.string().max(500, "Notes too long").optional(),
});

// ─── Complete audit form ─────────────────────────────────────────────────────
export const auditFormSchema = z.object({
  teamName: z
    .string()
    .min(1, "Team name is required")
    .max(100, "Team name too long"),
  teamSize: z
    .number({ error: "Enter a valid number" })
    .int("Must be a whole number")
    .min(1, "At least 1 team member")
    .max(100000, "That seems too high"),
  tools: z
    .array(auditToolEntrySchema)
    .min(1, "Add at least one AI tool to audit"),
});

// ─── Inferred types (used with react-hook-form) ─────────────────────────────
export type AuditToolEntryInput = z.infer<typeof auditToolEntrySchema>;
export type AuditFormInput = z.infer<typeof auditFormSchema>;
