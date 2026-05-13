# AI Prompts

> Prompts used in AI Spend Audit and how they're structured.

## Where AI Is Used

AI Spend Audit uses AI in exactly **one place**: generating a narrative summary paragraph on the results dashboard. This is purely cosmetic — the recommendations, savings numbers, and health scores are all produced by the deterministic rule engine.

## Gemini Summary Prompt

**Model:** Google Gemini (via API)
**Endpoint:** `POST /api/ai-summary`
**Trigger:** User clicks "Generate AI Summary" on the results page.

### Prompt Structure

The prompt is constructed dynamically from the audit report data:

```
You are a financial analyst specialising in SaaS spend optimisation for
early-stage startups.

Given the following audit data for {teamName} ({teamSize} team members):

Total monthly AI spend: {totalMonthly}/mo ({totalAnnual}/yr)
Tools audited: {toolCount}
Health score: {healthScore}/100
Total potential savings: {totalMonthlySavings}/mo ({totalAnnualSavings}/yr)

Top recommendations:
{recommendations mapped to: "- {title}: save {monthlySavings}/mo ({confidence} confidence)"}

Write a 2-3 paragraph executive summary that:
1. Highlights the most impactful finding
2. Puts the savings in annual terms
3. Gives one specific next step
4. Uses a professional but approachable tone

Keep it under 150 words. Do not use bullet points. Do not repeat the exact
numbers from the input — interpret them.
```

### Why This Structure

- **Role priming** ("financial analyst") — produces business-appropriate language
- **Structured data** — gives the model facts to work with, not open-ended generation
- **Output constraints** — word limit, no bullets, interpretation over repetition
- **Specific asks** — "one specific next step" prevents vague conclusions

### Example Output

> Your team is spending $620 per month across five AI tools — roughly $7,440 annually. The biggest opportunity is consolidating your coding assistants: you're paying for both Cursor Pro and GitHub Copilot Business, which have significant feature overlap. Dropping one would save your team over $1,100 per year with no loss in capability.
>
> Beyond consolidation, switching your remaining tools to annual billing would save an additional $480 per year. Combined, these two changes alone could reduce your AI spend by 21%.
>
> Start by surveying your developers this week: which coding assistant do they actually prefer? The answer will make the consolidation decision obvious.

## Prompt Design Principles

1. **No hallucinated data** — the prompt provides all numbers; the model interprets them
2. **No recommendation generation** — the model summarises, never decides
3. **Constrained output** — word limits prevent verbose responses
4. **Graceful degradation** — if the AI call fails, the dashboard still shows all data

## Rate Limiting

The AI summary endpoint is rate-limited to prevent abuse:
- IP-based limiting (hashed with salt)
- The summary is cached in the component state — regenerating requires a manual click

## Cost

At typical Gemini API pricing, each summary costs approximately $0.001–$0.003 (a few hundred input tokens + ~150 output tokens). At 1,000 audits/month, the total AI cost would be ~$3/month.
