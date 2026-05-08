/**
 * config/pricing/tools.ts
 * AI tool pricing catalog.
 *
 * Prices as of May 2026 — sourced from each vendor's public pricing page.
 * Usage-based plans show estimated monthly cost for a typical startup.
 */
import type { AiTool } from "./types";

export const AI_TOOLS: AiTool[] = [
  // ── Coding Assistants ────────────────────────────────────────────────────
  {
    id: "cursor",
    name: "Cursor",
    description: "AI-first code editor with autocomplete and chat",
    category: "coding-assistant",
    website: "https://cursor.sh",
    brandColor: "#7C3AED",
    iconName: "MousePointerClick",
    plans: [
      {
        id: "cursor-hobby",
        name: "Hobby",
        priceMonthly: 0,
        priceAnnual: null,
        features: ["2000 completions", "50 slow requests/mo"],
      },
      {
        id: "cursor-pro",
        name: "Pro",
        priceMonthly: 20,
        priceAnnual: 192,
        features: ["Unlimited completions", "500 fast requests/mo", "10 slow requests/day"],
      },
      {
        id: "cursor-business",
        name: "Business",
        priceMonthly: 40,
        priceAnnual: 384,
        features: ["Everything in Pro", "Admin dashboard", "SAML SSO", "Team billing"],
      },
    ],
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    description: "AI pair programmer for VS Code and JetBrains",
    category: "coding-assistant",
    website: "https://github.com/features/copilot",
    brandColor: "#238636",
    iconName: "Github",
    plans: [
      {
        id: "copilot-free",
        name: "Free",
        priceMonthly: 0,
        priceAnnual: null,
        features: ["2000 completions/mo", "50 chat messages/mo"],
      },
      {
        id: "copilot-pro",
        name: "Pro",
        priceMonthly: 10,
        priceAnnual: 100,
        features: ["Unlimited completions", "Unlimited chat", "Multi-file edits"],
      },
      {
        id: "copilot-business",
        name: "Business",
        priceMonthly: 19,
        priceAnnual: null,
        features: ["Organization policies", "Audit logs", "IP indemnity"],
      },
      {
        id: "copilot-enterprise",
        name: "Enterprise",
        priceMonthly: 39,
        priceAnnual: null,
        features: ["Everything in Business", "Knowledge base", "Custom models"],
      },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    description: "AI-powered IDE by Codeium with agentic workflows",
    category: "coding-assistant",
    website: "https://windsurf.com",
    brandColor: "#06B6D4",
    iconName: "Wind",
    plans: [
      {
        id: "windsurf-free",
        name: "Free",
        priceMonthly: 0,
        priceAnnual: null,
        features: ["5 User-AI interactions/day", "Basic autocomplete"],
      },
      {
        id: "windsurf-pro",
        name: "Pro",
        priceMonthly: 15,
        priceAnnual: 120,
        features: ["Unlimited flows", "GPT-4o and Claude access", "Priority support"],
      },
      {
        id: "windsurf-team",
        name: "Team",
        priceMonthly: 30,
        priceAnnual: 288,
        features: ["Everything in Pro", "Team management", "Shared context"],
      },
    ],
  },

  // ── Chat Assistants ──────────────────────────────────────────────────────
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "OpenAI's conversational AI for general tasks",
    category: "chat-assistant",
    website: "https://chat.openai.com",
    brandColor: "#10A37F",
    iconName: "MessageSquare",
    plans: [
      {
        id: "chatgpt-free",
        name: "Free",
        priceMonthly: 0,
        priceAnnual: null,
        features: ["GPT-4o mini", "Limited GPT-4o", "Basic web browsing"],
      },
      {
        id: "chatgpt-plus",
        name: "Plus",
        priceMonthly: 20,
        priceAnnual: null,
        features: ["GPT-4o", "DALL-E", "Advanced data analysis", "Custom GPTs"],
      },
      {
        id: "chatgpt-pro",
        name: "Pro",
        priceMonthly: 200,
        priceAnnual: null,
        features: ["Unlimited access", "o1 pro mode", "Advanced voice"],
      },
      {
        id: "chatgpt-team",
        name: "Team",
        priceMonthly: 30,
        priceAnnual: 300,
        features: ["Everything in Plus", "Admin console", "Higher limits"],
      },
    ],
  },
  {
    id: "claude",
    name: "Claude",
    description: "Anthropic's AI assistant for analysis and writing",
    category: "chat-assistant",
    website: "https://claude.ai",
    brandColor: "#D97757",
    iconName: "BookOpen",
    plans: [
      {
        id: "claude-free",
        name: "Free",
        priceMonthly: 0,
        priceAnnual: null,
        features: ["Claude 3.5 Sonnet", "Limited usage"],
      },
      {
        id: "claude-pro",
        name: "Pro",
        priceMonthly: 20,
        priceAnnual: null,
        features: ["Claude 3.5 Opus", "5x more usage", "Projects", "Priority access"],
      },
      {
        id: "claude-team",
        name: "Team",
        priceMonthly: 30,
        priceAnnual: null,
        features: ["Everything in Pro", "Team collaboration", "Admin controls"],
      },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Google's multimodal AI assistant",
    category: "chat-assistant",
    website: "https://gemini.google.com",
    brandColor: "#4285F4",
    iconName: "Sparkles",
    plans: [
      {
        id: "gemini-free",
        name: "Free",
        priceMonthly: 0,
        priceAnnual: null,
        features: ["Gemini 1.5 Flash", "Basic chat"],
      },
      {
        id: "gemini-advanced",
        name: "Advanced",
        priceMonthly: 20,
        priceAnnual: null,
        features: ["Gemini 1.5 Pro", "1TB storage", "Workspace integration"],
      },
      {
        id: "gemini-business",
        name: "Business",
        priceMonthly: 30,
        priceAnnual: null,
        features: ["Enterprise security", "Admin controls", "Audit logs"],
      },
    ],
  },

  // ── API Platforms ────────────────────────────────────────────────────────
  {
    id: "openai-api",
    name: "OpenAI API",
    description: "Pay-per-token API for GPT-4o, o1, embeddings, and more",
    category: "api-platform",
    website: "https://platform.openai.com",
    brandColor: "#412991",
    iconName: "Cpu",
    plans: [
      {
        id: "openai-api-payg",
        name: "Pay-as-you-go",
        priceMonthly: 100,
        priceAnnual: null,
        features: ["GPT-4o, o1, embeddings", "Per-token billing", "Rate limits"],
        usageBased: true,
      },
      {
        id: "openai-api-team",
        name: "Team Tier",
        priceMonthly: 500,
        priceAnnual: null,
        features: ["Higher rate limits", "Shared billing", "Team management"],
        usageBased: true,
      },
    ],
  },
  {
    id: "anthropic-api",
    name: "Anthropic API",
    description: "Pay-per-token API for Claude models",
    category: "api-platform",
    website: "https://console.anthropic.com",
    brandColor: "#D97757",
    iconName: "Braces",
    plans: [
      {
        id: "anthropic-api-payg",
        name: "Pay-as-you-go",
        priceMonthly: 100,
        priceAnnual: null,
        features: ["Claude 3.5 Sonnet/Opus", "Per-token billing", "Batch API"],
        usageBased: true,
      },
      {
        id: "anthropic-api-scale",
        name: "Scale",
        priceMonthly: 500,
        priceAnnual: null,
        features: ["Higher rate limits", "Priority support", "Custom agreements"],
        usageBased: true,
      },
    ],
  },
];
