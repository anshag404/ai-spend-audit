"use client";

/**
 * components/audit/tool-entry-card.tsx
 * Per-tool configuration card: plan, billing cycle, seats, spend, use case.
 */
import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Trash2, Info } from "lucide-react";
import {
  MousePointerClick,
  GitBranch,
  Wind,
  MessageSquare,
  BookOpen,
  Sparkles,
  Cpu,
  Braces,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/audit/form-field";
import { getToolById, USE_CASE_LABELS } from "@/config/pricing";
import type { UseCase, BillingCycle } from "@/config/pricing/types";
import type { AuditToolEntry } from "@/types/audit";

const ICON_MAP: Record<string, React.ElementType> = {
  MousePointerClick,
  Github: GitBranch,
  Wind,
  MessageSquare,
  BookOpen,
  Sparkles,
  Cpu,
  Braces,
};

interface ToolEntryCardProps {
  entry: AuditToolEntry;
  index: number;
  errors?: Record<string, string>;
  onChange: (index: number, field: keyof AuditToolEntry, value: unknown) => void;
  onRemove: (index: number) => void;
}

export function ToolEntryCard({
  entry,
  index,
  errors,
  onChange,
  onRemove,
}: ToolEntryCardProps) {
  const tool = getToolById(entry.toolId);

  const selectedPlan = tool?.plans.find((p) => p.id === entry.planId);
  const isUsageBased = selectedPlan?.usageBased ?? false;

  // Calculate the expected monthly cost based on plan + seats
  const expectedCost = useMemo(() => {
    if (!selectedPlan) return 0;
    const price =
      entry.billingCycle === "annual" && selectedPlan.priceAnnual !== null
        ? selectedPlan.priceAnnual / 12
        : selectedPlan.priceMonthly;
    return price * entry.seats;
  }, [selectedPlan, entry.billingCycle, entry.seats]);

  // Auto-update spend when plan/seats/cycle changes (only for non-usage-based)
  const handlePlanChange = useCallback(
    (planId: string) => {
      onChange(index, "planId", planId);
      if (!tool) return;
      const plan = tool.plans.find((p) => p.id === planId);
      if (plan && !plan.usageBased) {
        const price =
          entry.billingCycle === "annual" && plan.priceAnnual !== null
            ? plan.priceAnnual / 12
            : plan.priceMonthly;
        onChange(index, "monthlySpend", Math.round(price * entry.seats * 100) / 100);
      }
    },
    [onChange, index, tool, entry.billingCycle, entry.seats]
  );

  const handleCycleChange = useCallback(
    (cycle: BillingCycle) => {
      onChange(index, "billingCycle", cycle);
      if (selectedPlan && !selectedPlan.usageBased) {
        const price =
          cycle === "annual" && selectedPlan.priceAnnual !== null
            ? selectedPlan.priceAnnual / 12
            : selectedPlan.priceMonthly;
        onChange(index, "monthlySpend", Math.round(price * entry.seats * 100) / 100);
      }
    },
    [onChange, index, selectedPlan, entry.seats]
  );

  const handleSeatsChange = useCallback(
    (seats: number) => {
      onChange(index, "seats", seats);
      if (selectedPlan && !selectedPlan.usageBased) {
        const price =
          entry.billingCycle === "annual" && selectedPlan.priceAnnual !== null
            ? selectedPlan.priceAnnual / 12
            : selectedPlan.priceMonthly;
        onChange(index, "monthlySpend", Math.round(price * seats * 100) / 100);
      }
    },
    [onChange, index, selectedPlan, entry.billingCycle]
  );

  if (!tool) return null;

  const Icon = ICON_MAP[tool.iconName] ?? Cpu;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, transition: { duration: 0.2 } }}
      className="rounded-xl border border-border/50 bg-card/40 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
            style={{
              backgroundColor: `${tool.brandColor}15`,
              color: tool.brandColor,
            }}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{tool.name}</p>
            <p className="text-xs text-muted-foreground">{tool.description}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(index)}
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Remove ${tool.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Plan selection */}
        <FormField
          id={`tool-${index}-plan`}
          label="Plan"
          required
          error={errors?.planId}
        >
          <div className="flex flex-wrap gap-2">
            {tool.plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => handlePlanChange(plan.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                  "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-1",
                  entry.planId === plan.id
                    ? "border-brand/50 bg-brand/10 text-brand"
                    : "border-border/50 bg-background/60 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {plan.name}
                {plan.priceMonthly > 0 && (
                  <span className="ml-1 opacity-70">
                    ${plan.priceMonthly}/mo
                  </span>
                )}
                {plan.priceMonthly === 0 && (
                  <span className="ml-1 opacity-70">Free</span>
                )}
              </button>
            ))}
          </div>
        </FormField>

        {/* Billing cycle */}
        <FormField
          id={`tool-${index}-cycle`}
          label="Billing cycle"
          error={errors?.billingCycle}
        >
          <div className="flex gap-2">
            {(["monthly", "annual"] as BillingCycle[]).map((cycle) => {
              const hasAnnual =
                selectedPlan?.priceAnnual !== null && selectedPlan?.priceAnnual !== undefined;
              const disabled = cycle === "annual" && !hasAnnual;
              return (
                <button
                  key={cycle}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleCycleChange(cycle)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                    "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-1",
                    disabled && "opacity-40 cursor-not-allowed",
                    entry.billingCycle === cycle && !disabled
                      ? "border-brand/50 bg-brand/10 text-brand"
                      : "border-border/50 bg-background/60 text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  {cycle === "monthly" ? "Monthly" : "Annual"}
                  {cycle === "annual" && hasAnnual && selectedPlan && (
                    <span className="ml-1 text-green-400 opacity-80">
                      Save{" "}
                      {Math.round(
                        ((selectedPlan.priceMonthly * 12 - selectedPlan.priceAnnual!) /
                          (selectedPlan.priceMonthly * 12)) *
                          100
                      )}
                      %
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </FormField>

        {/* Seats */}
        <FormField
          id={`tool-${index}-seats`}
          label="Seats / Licenses"
          required
          error={errors?.seats}
        >
          <Input
            id={`tool-${index}-seats`}
            type="number"
            min={1}
            max={10000}
            value={entry.seats}
            onChange={(e) =>
              handleSeatsChange(parseInt(e.target.value) || 1)
            }
            className="max-w-[120px]"
          />
        </FormField>

        {/* Monthly spend */}
        <FormField
          id={`tool-${index}-spend`}
          label="Monthly spend (USD)"
          required
          error={errors?.monthlySpend}
          description={
            isUsageBased
              ? "Usage-based — enter your actual monthly cost"
              : undefined
          }
        >
          <div className="relative max-w-[160px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id={`tool-${index}-spend`}
              type="number"
              min={0}
              step={0.01}
              value={entry.monthlySpend}
              onChange={(e) =>
                onChange(
                  index,
                  "monthlySpend",
                  parseFloat(e.target.value) || 0
                )
              }
              className="pl-7"
            />
          </div>
          {!isUsageBased && expectedCost !== entry.monthlySpend && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Info className="h-3 w-3" />
              Expected: {formatCurrency(expectedCost)}/mo
            </p>
          )}
        </FormField>

        {/* Use case */}
        <FormField
          id={`tool-${index}-usecase`}
          label="Primary use case"
          required
          error={errors?.useCase}
          className="sm:col-span-2"
        >
          <div className="flex flex-wrap gap-2">
            {(Object.entries(USE_CASE_LABELS) as [UseCase, string][]).map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange(index, "useCase", value)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                    "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-1",
                    entry.useCase === value
                      ? "border-brand/50 bg-brand/10 text-brand"
                      : "border-border/50 bg-background/60 text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </FormField>
      </div>

      {/* Footer summary */}
      <div className="px-5 py-3 border-t border-border/30 bg-muted/20 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {entry.seats} seat{entry.seats !== 1 ? "s" : ""} ×{" "}
          {selectedPlan?.name ?? "—"} ({entry.billingCycle})
        </p>
        <p className="text-sm font-semibold text-foreground">
          {formatCurrency(entry.monthlySpend)}
          <span className="text-xs font-normal text-muted-foreground">/mo</span>
        </p>
      </div>
    </motion.div>
  );
}
