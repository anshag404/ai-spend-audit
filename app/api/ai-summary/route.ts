/**
 * app/api/ai-summary/route.ts
 * API route that generates a personalized audit summary using Gemini.
 *
 * Falls back gracefully if:
 * - No API key is configured
 * - Rate limit is hit
 * - The model returns an error
 *
 * The client-side component handles the fallback UI — this route
 * just needs to return { summary: string } or a non-200 status.
 */
import { NextRequest, NextResponse } from "next/server";
import type { AuditReport } from "@/lib/engine/audit-types";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // No API key → tell client to use fallback
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI summary not configured" },
        { status: 503 }
      );
    }

    const { report } = (await request.json()) as { report: AuditReport };

    if (!report) {
      return NextResponse.json(
        { error: "Missing report data" },
        { status: 400 }
      );
    }

    // Build a concise prompt
    const prompt = buildPrompt(report);

    // Call Gemini API
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
            topP: 0.9,
          },
        }),
      }
    );

    if (!res.ok) {
      console.error("[ai-summary] Gemini API error:", res.status);
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

    if (!text) {
      return NextResponse.json(
        { error: "Empty AI response" },
        { status: 502 }
      );
    }

    return NextResponse.json({ summary: text.trim() });
  } catch (error) {
    console.error("[ai-summary] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function buildPrompt(report: AuditReport): string {
  const { summary, spend, recommendations, teamName, toolCount, teamSize } =
    report;

  const topRecs = recommendations
    .slice(0, 3)
    .map(
      (r) =>
        `- ${r.title} (saves $${r.annualSavings}/yr, ${r.confidence} confidence)`
    )
    .join("\n");

  return `You are a concise financial advisor for startups. Write a ~100 word executive summary of this AI spend audit.

CONTEXT:
- Company: ${teamName} (${teamSize} people)
- Tools audited: ${toolCount}
- Current spend: $${spend.totalMonthly}/mo ($${spend.totalAnnual}/yr)
- Potential savings: $${summary.totalAnnualSavings}/yr (${summary.savingsPercentage}% of spend)
- Health score: ${summary.healthScore}/100
- ${summary.actionableCount} actionable recommendations (${summary.highConfidenceCount} high confidence)

TOP RECOMMENDATIONS:
${topRecs || "No savings found — stack is well-optimised."}

REQUIREMENTS:
- Founder-friendly, direct tone (like a CFO memo)
- Start with the headline number
- Mention the top 1-2 actions
- End with a clear next step
- No fluff, no disclaimers, no "here's your summary" preamble
- Do NOT use markdown formatting`;
}
