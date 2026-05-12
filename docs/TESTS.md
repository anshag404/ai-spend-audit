# Testing Strategy

> How we test AI Spend Audit and why.

## Philosophy

**Test the engine, not the UI.**

The recommendation engine is the core product. If `ruleAnnualBilling` returns wrong savings, users get bad advice. If a button's hover colour is off by 2px, nobody notices. We invest testing time where bugs have the highest business impact.

## Test Suite Overview

| File | Tests | What It Covers |
|------|-------|----------------|
| `lib/engine/__tests__/engine.test.ts` | 36 | Calculator, rules, engine integration, edge cases |
| `lib/schemas/audit-schema.test.ts` | 4 | Zod form validation |
| **Total** | **40** | |

**Runtime:** <2 seconds via Vitest.

## Test Categories

### 1. Calculator Tests (8 tests)

Tests for the financial math functions that underpin every recommendation.

| Function | What's Tested |
|----------|---------------|
| `effectiveMonthly()` | Fixed plan cost, user-reported overrides, annual billing conversion |
| `annualSwitchSavings()` | Monthly→annual delta, already-annual returns 0, no-annual-option returns 0, seat scaling |
| `round2()` | Rounding to 2 decimal places |
| `buildSpendBreakdown()` | Total monthly/annual, top spender identification, cost per team member |
| `calculateHealthScore()` | Perfect score (100), savings deductions, redundancy deductions, floor at 0 |

### 2. Rule Tests (14 tests)

Each of the 6 rules has focused tests for both the "fires" and "doesn't fire" cases.

| Rule | "Should Fire" Test | "Should Not Fire" Test |
|------|-------------------|----------------------|
| `ruleAnnualBilling` | Monthly billing with annual option available | Already on annual billing |
| `ruleSeatReduction` | 10 seats, team of 5 | Seats match team size; free plan |
| `rulePlanDowngrade` | Business plan on 2-person team | Larger teams (10+) |
| `ruleConsolidateTools` | Two paid tools in same category | API platforms (intentionally excluded) |
| `ruleChatGptProAudit` | ChatGPT Pro ($200/mo) | ChatGPT Plus ($20/mo) |
| `ruleApiOptimisation` | $1000/mo API spend, 5-person team | $50/mo API spend (below threshold) |

### 3. Integration Tests (3 tests)

Full `runAudit()` calls that verify the complete pipeline.

- **Complete report structure** — verifies teamName, toolCount, spend totals, recommendation sorting, health score range
- **ChatGPT Pro detection** — specific scenario: 3 seats × $200/mo → expects $540/mo savings recommendation
- **Complementary recommendations** — 10 seats on monthly billing with a team of 3 → expects both seat reduction AND annual billing suggestions

### 4. Edge Case Tests (3 tests)

- **Free plan, single tool** — no savings, health score = 100
- **Team size of 1** — cost per member equals total spend
- **Huge team, tiny tools** — no negative savings produced

### 5. Schema Validation Tests (4 tests)

- **Valid form data** — passes Zod validation
- **Missing fields** — fails with appropriate errors
- **Empty tools array** — fails (need at least 1 tool)
- **Invalid seat count** — fails (seats must be ≥ 1)

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file changes)
npm run test:watch
```

## CI Integration

Tests run automatically on every push via GitHub Actions:

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: npm test
```

The pipeline is: **Lint → Type-check → Test → Build**. If any step fails, the pipeline stops.

## What We Don't Test (and Why)

| Category | Reason |
|----------|--------|
| React component rendering | UI bugs are caught visually, not by unit tests |
| API routes | Would require mocking Supabase/Gemini — integration test territory |
| localStorage persistence | Browser-specific, tested manually |
| CSS/styling | Visual regression testing is overkill for a 7-day MVP |

## Adding New Tests

When adding a new recommendation rule:

1. Add a "fires" test with a fixture that triggers the rule
2. Add a "doesn't fire" test with a fixture that should be skipped
3. Verify the `monthlySavings` value matches your expected math
4. Run `npm test` to confirm all tests pass
