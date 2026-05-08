"use client";

/**
 * components/audit/tool-selector.tsx
 * Visual grid for selecting which AI tools to audit.
 * Supports toggling tools on/off with animated transitions.
 */
import { motion } from "framer-motion";
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
import { cn } from "@/lib/utils";
import { AI_TOOLS, CATEGORY_LABELS, getCategories } from "@/config/pricing";
import type { AiTool } from "@/config/pricing/types";

// Map icon names to actual components
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

interface ToolSelectorProps {
  selectedToolIds: string[];
  onToggle: (toolId: string) => void;
}

export function ToolSelector({ selectedToolIds, onToggle }: ToolSelectorProps) {
  const categories = getCategories();

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const tools = AI_TOOLS.filter((t) => t.category === category);
        if (tools.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3">
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {tools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  selected={selectedToolIds.includes(tool.id)}
                  onToggle={() => onToggle(tool.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Individual tool card ────────────────────────────────────────────────────

function ToolCard({
  tool,
  selected,
  onToggle,
}: {
  tool: AiTool;
  selected: boolean;
  onToggle: () => void;
}) {
  const Icon = ICON_MAP[tool.iconName] ?? Cpu;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all cursor-pointer",
        "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2",
        selected
          ? "border-brand/50 bg-brand/5 shadow-md shadow-brand/10"
          : "border-border/50 bg-card/40 hover:border-border hover:bg-card/60"
      )}
      aria-pressed={selected}
      aria-label={`${selected ? "Remove" : "Add"} ${tool.name}`}
    >
      {/* Selected indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-brand flex items-center justify-center"
        >
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      )}

      {/* Icon */}
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{
          backgroundColor: `${tool.brandColor}15`,
          color: tool.brandColor,
        }}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>

      {/* Info */}
      <div>
        <p className="text-sm font-semibold text-foreground">{tool.name}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {tool.description}
        </p>
      </div>

      {/* Plan count */}
      <p className="text-xs text-muted-foreground/70">
        {tool.plans.length} plan{tool.plans.length !== 1 ? "s" : ""}
      </p>
    </motion.button>
  );
}
