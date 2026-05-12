# Reflection

> What I'd do differently, what surprised me, and what I learned.

## What Went Well

### The engine-first approach paid off
Building the recommendation engine on Day 3 — before the dashboard — forced me to define the data contract early. Every component downstream (`SavingsHero`, `RecommendationCard`, `ToolBreakdown`) had a stable interface to build against. Zero integration bugs when connecting the engine to the UI.

### localStorage as the primary data layer
Not requiring auth for the core experience was the right call. Users paste their subscriptions, click generate, and see results. No sign-up friction. The email capture happens *after* value delivery, which is the correct order for a free tool. Conversion should be higher because users already trust the product.

### Rule-based engine over LLM
Making recommendations deterministic was critical for trust. When a user sees "Switch Cursor Pro to annual → save $48/yr", they can verify that math themselves. An LLM might hallucinate a plan that doesn't exist. For financial advice, determinism > creativity.

### Dark mode only
Eliminating the light/dark toggle saved ~4 hours of design iteration and testing. The target audience (developers and startup founders) overwhelmingly prefers dark mode. One theme = one set of colour tokens = fewer bugs.

## What I'd Do Differently

### Start with the pricing data schema
I defined the tool/plan data structure on Day 3 but revised it twice. If I'd locked the schema on Day 1, the form components would have been cleaner from the start. Lesson: data shapes are the most important design decision in a data-heavy app.

### Add integration tests earlier
Unit testing the engine was straightforward. What I didn't test was the full flow: form → engine → localStorage → results dashboard. A single Playwright test covering this path would have caught the hydration edge cases earlier.

### Design the share flow earlier
The shareable report feature (/r/[slug]) was added on Day 4, which meant the save API had to be retrofitted. If I'd planned for sharing from Day 1, the data flow would be cleaner — save on generate, not as an afterthought.

## Surprises

### Pricing data is the real moat
Gathering accurate, up-to-date pricing for 10+ AI tools took longer than expected. Many vendors don't publish annual pricing clearly. Some bury enterprise pricing behind "Contact Sales". This data — if kept current — is genuinely valuable and hard to replicate.

### The engine was simpler than expected
I budgeted a full day for the recommendation engine. The core logic (6 rules) took ~3 hours. What took time was the *edge cases*: free plans with seat limits, usage-based pricing without fixed costs, tools with no annual option. Business logic is 30% rules, 70% exceptions.

### PostHog integration complexity
I expected `posthog.init()` + `posthog.capture()` to be plug-and-play. In practice, server components, conditional initialisation, and Next.js 16's strict effect rules made it trickier than anticipated.

## What I Learned

1. **Ship the engine before the UI.** Data contracts should drive component design, not the reverse.
2. **localStorage is underrated for MVPs.** No auth, no server, no latency. Just `JSON.parse()`.
3. **Zod + react-hook-form is the gold standard.** Type-safe validation with zero boilerplate.
4. **Test business logic, not UI.** The 40 engine tests catch real bugs. Testing button clicks catches nothing.
5. **Dark mode only is fine.** One less decision for users, one less surface for bugs.
6. **Vitest is fast.** 40 tests in <2 seconds. No reason to avoid testing.
7. **Accessibility is not optional.** ARIA attributes and semantic HTML are cheap to add during development, expensive to retrofit.

## If I Had 2 More Weeks

| Priority | Feature | Why |
|----------|---------|-----|
| 1 | User accounts + saved audits | Retention — users can track spend over time |
| 2 | PDF export | Users want to email reports to their CFO |
| 3 | More tools (20+) | Broader coverage = more relevant results |
| 4 | Benchmark data | "Your team spends 2x the median for your size" |
| 5 | Slack/email alerts | "Your Cursor bill went up 30% this month" |
| 6 | Chrome extension | Detect AI tools from browser history |

## Final Thought

The biggest risk for this product isn't technical — it's distribution. The engine works. The UI is polished. The question is: can I get 1,000 startups to paste their subscriptions into a free tool? That's a marketing problem, not an engineering one.
