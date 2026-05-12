# Pricing Data

> Sources, methodology, and maintenance plan for the AI tool pricing catalog.

## Current Catalog

**10 tools, 33 plans** as of May 2026.

### Coding Assistants

| Tool | Plans | Monthly Range | Annual Available | Source |
|------|-------|---------------|-----------------|--------|
| **Cursor** | Hobby, Pro, Business | $0–$40 | ✅ Pro ($192/yr), Business ($384/yr) | [cursor.sh/pricing](https://cursor.sh/pricing) |
| **GitHub Copilot** | Free, Pro, Business, Enterprise | $0–$39 | ✅ Pro ($100/yr) | [github.com/features/copilot](https://github.com/features/copilot) |
| **Windsurf** | Free, Pro, Team | $0–$30 | ✅ Pro ($120/yr), Team ($288/yr) | [windsurf.com](https://windsurf.com) |

### Chat Assistants

| Tool | Plans | Monthly Range | Annual Available | Source |
|------|-------|---------------|-----------------|--------|
| **ChatGPT** | Free, Plus, Pro, Team | $0–$200 | ✅ Team ($300/yr) | [openai.com/chatgpt/pricing](https://openai.com/chatgpt/pricing) |
| **Claude** | Free, Pro, Team | $0–$30 | ❌ | [claude.ai/pricing](https://claude.ai) |
| **Gemini** | Free, Advanced, Business | $0–$30 | ❌ | [gemini.google.com](https://gemini.google.com) |

### API Platforms

| Tool | Plans | Typical Monthly | Usage-Based | Source |
|------|-------|----------------|-------------|--------|
| **OpenAI API** | Pay-as-you-go, Team | $100–$500 (estimate) | ✅ | [platform.openai.com/pricing](https://platform.openai.com/pricing) |
| **Anthropic API** | Pay-as-you-go, Scale | $100–$500 (estimate) | ✅ | [docs.anthropic.com](https://docs.anthropic.com) |

## Data Accuracy

### Fixed-price plans
Prices are sourced directly from each vendor's public pricing page. These are accurate as of the dates noted.

### Usage-based plans
API platforms use **estimated** monthly costs ($100 and $500) as defaults. The user overrides these with their actual spend during the audit. The estimates serve as sensible starting points only.

### Annual pricing
Annual prices are exact where published. Some vendors (Claude, ChatGPT Pro) don't offer annual pricing — these are marked accordingly and the annual billing rule skips them.

## How Pricing Data Is Used

1. **Plan lookup** — `costOnPlan(toolId, planId)` returns the monthly price for any plan.
2. **Effective cost** — `effectiveMonthly(entry)` computes the real cost considering user-reported spend, seat count, and billing cycle.
3. **Annual savings** — `annualSwitchSavings(entry)` computes the monthly delta between monthly and annual billing.
4. **Rule execution** — Rules reference plan prices to calculate specific savings amounts.

## Maintenance Plan

### Frequency
Prices should be verified **quarterly**. AI tool pricing changes frequently (e.g., OpenAI added free tiers in late 2024, GitHub Copilot restructured in early 2025).

### Process
1. Visit each vendor's pricing page (URLs in the source column above)
2. Update `config/pricing/tools.ts` with any changes
3. Run `npm test` to verify no rules broke
4. Commit with a message like `data: Update Cursor pricing (May 2026)`

### Adding a New Tool
1. Add the tool object to the `AI_TOOLS` array in `config/pricing/tools.ts`
2. Follow the `AiTool` type contract (id, name, category, plans)
3. The tool will automatically appear in the audit form's selector
4. Existing rules will apply to it if it matches their criteria (e.g., annual billing rule)
5. If the tool has unique optimisation opportunities, add a specific rule in `lib/engine/rules.ts`

## Pricing Data Risks

| Risk | Mitigation |
|------|-----------|
| Vendor changes prices | Quarterly review + user-reported spend overrides |
| Vendor adds new plans | Won't break existing audits, just won't suggest the new plan |
| Vendor removes plans | `costOnPlan` returns 0 for unknown plans — safe fallback |
| Currency differences | All prices in USD — matches vendor pricing pages |
