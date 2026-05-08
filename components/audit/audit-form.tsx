"use client";

/**
 * components/audit/audit-form.tsx
 * Main audit form orchestrator.
 *
 * Architecture: instead of react-hook-form for the whole nested form
 * (which fights with dynamic array fields and custom pill selectors),
 * we manage state manually and validate with zod on submit.
 * This gives us full control over the UX.
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  RotateCcw,
  DollarSign,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/audit/form-field";
import { ToolSelector } from "@/components/audit/tool-selector";
import { ToolEntryCard } from "@/components/audit/tool-entry-card";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { auditFormSchema } from "@/lib/schemas/audit-schema";
import { getToolById, AI_TOOLS } from "@/config/pricing";
import { formatCurrency } from "@/lib/utils";
import type { AuditFormData, AuditFormStep, AuditToolEntry } from "@/types/audit";

// ─── Default new entry ──────────────────────────────────────────────────────
function createDefaultEntry(toolId: string): AuditToolEntry {
  const tool = getToolById(toolId);
  const defaultPlan = tool?.plans[1] ?? tool?.plans[0];
  const monthlySpend = defaultPlan?.priceMonthly ?? 0;

  return {
    toolId,
    planId: defaultPlan?.id ?? "",
    billingCycle: "monthly",
    seats: 1,
    monthlySpend,
    useCase: "code-generation",
  };
}

// ─── Empty form state ───────────────────────────────────────────────────────
const EMPTY_FORM: AuditFormData = {
  teamName: "",
  teamSize: 5,
  tools: [],
};

const STORAGE_KEY = "ai-spend-audit-draft";

// ─── Component ──────────────────────────────────────────────────────────────
export function AuditForm() {
  const [formData, setFormData, clearFormData] =
    useLocalStorage<AuditFormData>(STORAGE_KEY, EMPTY_FORM);
  const [step, setStep] = useState<AuditFormStep>("select-tools");
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Derived state ──────────────────────────────────────────────────────
  const selectedToolIds = useMemo(
    () => formData.tools.map((t) => t.toolId),
    [formData.tools]
  );

  const totalMonthlySpend = useMemo(
    () => formData.tools.reduce((sum, t) => sum + t.monthlySpend, 0),
    [formData.tools]
  );

  const totalSeats = useMemo(
    () => formData.tools.reduce((sum, t) => sum + t.seats, 0),
    [formData.tools]
  );

  // ─── Tool toggle ────────────────────────────────────────────────────────
  const handleToggleTool = useCallback(
    (toolId: string) => {
      setFormData((prev) => {
        const exists = prev.tools.some((t) => t.toolId === toolId);
        return {
          ...prev,
          tools: exists
            ? prev.tools.filter((t) => t.toolId !== toolId)
            : [...prev.tools, createDefaultEntry(toolId)],
        };
      });
    },
    [setFormData]
  );

  // ─── Tool entry field change ────────────────────────────────────────────
  const handleEntryChange = useCallback(
    (index: number, field: keyof AuditToolEntry, value: unknown) => {
      setFormData((prev) => {
        const tools = [...prev.tools];
        tools[index] = { ...tools[index], [field]: value };
        return { ...prev, tools };
      });
    },
    [setFormData]
  );

  // ─── Remove tool ───────────────────────────────────────────────────────
  const handleRemoveTool = useCallback(
    (index: number) => {
      setFormData((prev) => ({
        ...prev,
        tools: prev.tools.filter((_, i) => i !== index),
      }));
    },
    [setFormData]
  );

  // ─── Step navigation ───────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (step === "select-tools") {
      if (formData.tools.length === 0) {
        setErrors({ tools: "Select at least one AI tool" });
        return;
      }
      setErrors({});
      setStep("configure");
    } else if (step === "configure") {
      setErrors({});
      setStep("review");
    }
  }, [step, formData.tools.length]);

  const handleBack = useCallback(() => {
    if (step === "configure") setStep("select-tools");
    else if (step === "review") setStep("configure");
  }, [step]);

  // ─── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const result = auditFormSchema.safeParse(formData);
    if (!result.success) {
      // Map zod errors to a flat object
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    // TODO: Day 3+ — send to Supabase / API
    // For now, navigate to results with data in localStorage
    await new Promise((r) => setTimeout(r, 1500)); // Simulate API call
    window.location.href = "/results";
  }, [formData]);

  // ─── Reset ──────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    clearFormData();
    setStep("select-tools");
    setErrors({});
  }, [clearFormData]);

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          {(
            [
              { key: "select-tools", label: "Select Tools", num: 1 },
              { key: "configure", label: "Configure", num: 2 },
              { key: "review", label: "Review & Submit", num: 3 },
            ] as const
          ).map(({ key, label, num }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                // Allow navigating back to completed steps
                const steps: AuditFormStep[] = [
                  "select-tools",
                  "configure",
                  "review",
                ];
                const currentIdx = steps.indexOf(step);
                const targetIdx = steps.indexOf(key);
                if (targetIdx <= currentIdx) setStep(key);
              }}
              className="flex items-center gap-2 text-xs font-medium"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                  step === key
                    ? "bg-brand text-white"
                    : (
                        ["select-tools", "configure", "review"].indexOf(key) <
                        ["select-tools", "configure", "review"].indexOf(step)
                      )
                      ? "bg-brand/20 text-brand"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {num}
              </span>
              <span
                className={`hidden sm:inline ${
                  step === key
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-brand rounded-full"
            initial={false}
            animate={{
              width:
                step === "select-tools"
                  ? "33%"
                  : step === "configure"
                    ? "66%"
                    : "100%",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === "select-tools" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Which AI tools does your team use?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select all the AI tools and services your team is currently
                paying for. You&apos;ll configure details next.
              </p>
            </div>

            <ToolSelector
              selectedToolIds={selectedToolIds}
              onToggle={handleToggleTool}
            />

            {typeof errors.tools === "string" && (
              <p className="mt-4 text-sm text-destructive" role="alert">
                {errors.tools}
              </p>
            )}

            {/* Selected summary */}
            {formData.tools.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center gap-3 text-sm text-muted-foreground"
              >
                <span className="font-semibold text-foreground">
                  {formData.tools.length}
                </span>{" "}
                tool{formData.tools.length !== 1 ? "s" : ""} selected
              </motion.div>
            )}
          </motion.div>
        )}

        {step === "configure" && (
          <motion.div
            key="configure"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Team info */}
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl border border-border/50 bg-card/30">
              <FormField
                id="team-name"
                label="Team / Company name"
                required
                error={errors.teamName as string}
              >
                <Input
                  id="team-name"
                  placeholder="Acme Corp"
                  value={formData.teamName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      teamName: e.target.value,
                    }))
                  }
                  className="max-w-xs"
                />
              </FormField>

              <FormField
                id="team-size"
                label="Team size"
                required
                description="How many people use AI tools on your team?"
                error={errors.teamSize as string}
              >
                <Input
                  id="team-size"
                  type="number"
                  min={1}
                  max={100000}
                  value={formData.teamSize}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      teamSize: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="max-w-[120px]"
                />
              </FormField>
            </div>

            {/* Per-tool configuration */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Configure your tools
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Set the plan, seats, and spend for each tool.
              </p>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {formData.tools.map((entry, index) => (
                  <ToolEntryCard
                    key={entry.toolId}
                    entry={entry}
                    index={index}
                    errors={
                      Object.fromEntries(
                        Object.entries(errors)
                          .filter(([k]) =>
                            k.startsWith(`tools.${index}.`)
                          )
                          .map(([k, v]) => [
                            k.replace(`tools.${index}.`, ""),
                            v as string,
                          ])
                      )
                    }
                    onChange={handleEntryChange}
                    onRemove={handleRemoveTool}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Add more tools */}
            <Button
              type="button"
              variant="outline"
              className="mt-4 gap-2"
              onClick={() => setStep("select-tools")}
            >
              <Plus className="h-4 w-4" />
              Add more tools
            </Button>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Review your audit
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Confirm your details and submit to get your savings report.
              </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl border border-border/50 bg-card/40 p-5">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs font-medium">Monthly spend</span>
                </div>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {formatCurrency(totalMonthlySpend)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatCurrency(totalMonthlySpend * 12)}/year
                </p>
              </div>

              <div className="rounded-xl border border-border/50 bg-card/40 p-5">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-medium">Total seats</span>
                </div>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {totalSeats}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  across {formData.tools.length} tool
                  {formData.tools.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="rounded-xl border border-border/50 bg-card/40 p-5">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Wrench className="h-4 w-4" />
                  <span className="text-xs font-medium">Team</span>
                </div>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {formData.teamName || "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formData.teamSize} member{formData.teamSize !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Tool list */}
            <div className="rounded-xl border border-border/50 overflow-hidden mb-8">
              <div className="px-5 py-3 border-b border-border/40 bg-muted/20">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Tool breakdown
                </p>
              </div>
              {formData.tools.map((entry) => {
                const tool = getToolById(entry.toolId);
                const plan = tool?.plans.find((p) => p.id === entry.planId);
                return (
                  <div
                    key={entry.toolId}
                    className="flex items-center justify-between px-5 py-3 border-b border-border/30 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {tool?.name ?? entry.toolId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {plan?.name ?? "—"} · {entry.seats} seat
                        {entry.seats !== 1 ? "s" : ""} · {entry.billingCycle}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(entry.monthlySpend)}
                      <span className="text-xs font-normal text-muted-foreground">
                        /mo
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Validation errors */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-6 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <p className="text-sm font-medium text-destructive mb-2">
                  Please fix the following:
                </p>
                <ul className="list-disc list-inside text-xs text-destructive space-y-1">
                  {Object.entries(errors).map(([key, msg]) => (
                    <li key={key}>{msg as string}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="mt-10 flex items-center justify-between border-t border-border/40 pt-6">
        <div className="flex gap-2">
          {step !== "select-tools" && (
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-muted-foreground gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {step !== "review" ? (
          <Button
            onClick={handleNext}
            className="bg-brand hover:bg-brand/90 text-white gap-2"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-brand hover:bg-brand/90 text-white gap-2"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <RotateCcw className="h-4 w-4" />
                </motion.div>
                Analyzing...
              </>
            ) : (
              <>
                Run audit
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
