/**
 * config/pricing/index.ts
 * Barrel export for the pricing configuration module.
 */
export * from "./types";
export * from "./tools";

// ─── Helpers ─────────────────────────────────────────────────────────────────
import { AI_TOOLS } from "./tools";
import type { AiTool, ToolCategory } from "./types";

/** Look up a tool by its ID slug. */
export function getToolById(id: string): AiTool | undefined {
  return AI_TOOLS.find((t) => t.id === id);
}

/** Filter tools by category. */
export function getToolsByCategory(category: ToolCategory): AiTool[] {
  return AI_TOOLS.filter((t) => t.category === category);
}

/** Get all unique categories present in the catalog. */
export function getCategories(): ToolCategory[] {
  return [...new Set(AI_TOOLS.map((t) => t.category))];
}

/** Human-readable category labels. */
export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  "coding-assistant": "Coding Assistants",
  "chat-assistant": "Chat Assistants",
  "api-platform": "API Platforms",
  "design-tool": "Design Tools",
};
