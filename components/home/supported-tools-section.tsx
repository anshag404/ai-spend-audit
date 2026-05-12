"use client";

/**
 * components/home/supported-tools-section.tsx
 * Premium AI ecosystem grid with tool logos.
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
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

const tools = [
  { name: "Cursor", icon: MousePointerClick, color: "#7C3AED", category: "Coding" },
  { name: "GitHub Copilot", icon: GitBranch, color: "#238636", category: "Coding" },
  { name: "Windsurf", icon: Wind, color: "#06B6D4", category: "Coding" },
  { name: "ChatGPT", icon: MessageSquare, color: "#10A37F", category: "Chat" },
  { name: "Claude", icon: BookOpen, color: "#D97757", category: "Chat" },
  { name: "Gemini", icon: Sparkles, color: "#4285F4", category: "Chat" },
  { name: "OpenAI API", icon: Cpu, color: "#412991", category: "API" },
  { name: "Anthropic API", icon: Braces, color: "#D97757", category: "API" },
];

export function SupportedToolsSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="supported-tools" ref={ref} className="border-t border-border/40">
      <div className="container-page py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">
            Supported Tools
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            We know the AI pricing landscape
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Our pricing database covers the most popular AI tools used by startup engineering teams —
            with real plan tiers, seat pricing, and annual billing options.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {tools.map((tool, i) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
              className="group relative flex flex-col items-center gap-3 rounded-xl border border-border/30 bg-card/30 p-6 hover:border-border/60 hover:bg-card/50 transition-all cursor-default"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                style={{ backgroundColor: `${tool.color}10` }}
              >
                <tool.icon className="h-6 w-6" style={{ color: tool.color }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">{tool.name}</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">{tool.category} Assistant</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Pricing data sourced from official vendor pages · Updated May 2026
        </p>
      </div>
    </section>
  );
}
