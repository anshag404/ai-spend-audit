# Architecture

> System design and technical decisions for AI Spend Audit.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│                                                          │
│  Landing Page ──→ Audit Form ──→ Results Dashboard       │
│  (Server Component)  (Client)      (Client + API)        │
│                                                          │
│  localStorage: draft form state, audit report cache      │
└──────────────┬───────────────────────────┬───────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────┐    ┌──────────────────────────────┐
│   Next.js API Routes │    │     Static Generation        │
│                      │    │                              │
│  POST /api/audit/save│    │  / (landing)                 │
│  POST /api/ai-summary│    │  /audit (form shell)         │
│  POST /api/leads     │    │  /results (dashboard shell)  │
└──────────┬───────────┘    └──────────────────────────────┘
           │
           ▼
┌──────────────────────┐    ┌──────────────────────────┐
│      Supabase        │    │     External APIs        │
│                      │    │                          │
│  PostgreSQL (audits, │    │  Google Gemini (summary) │
│  leads, share slugs) │    │  Resend (emails)         │
│  Row Level Security  │    │  PostHog (analytics)     │
└──────────────────────┘    └──────────────────────────┘
```

## Core Design Decisions

### 1. Client-Side Audit Engine (No Server Round-Trip)

The recommendation engine runs **entirely in the browser**. When the user clicks "Generate Report", the engine processes their input locally, and the results appear instantly.

**Why:**
- **Zero latency** — no API call to wait for. Results feel instant.
- **Privacy** — tool and spend data never leaves the user's browser unless they choose to save/share.
- **Cost** — no server compute for the core product. The engine is pure TypeScript math.
- **Reliability** — works offline after the page loads. No server dependency.

**Tradeoff:** The pricing catalog is bundled with the client. At ~8KB gzipped for 10 tools, this is negligible. If the catalog grows to 200+ tools, we'd move to a server-side lookup.

### 2. Rule-Based Engine (No LLMs for Recommendations)

Every recommendation is produced by a deterministic rule function. No AI. No LLMs. No probabilistic outputs.

```
Rule Function → (RuleContext) → Recommendation[]
```

**Why:**
- **Auditable** — every recommendation traces to a specific rule with clear math.
- **Predictable** — same input always produces the same output.
- **Fast** — no API latency, no token costs.
- **Trustworthy** — users can verify the math. "Switch to annual billing saves $4/mo" is a checkable fact.

**Where AI is used:** Google Gemini generates an optional **narrative summary** of the report (a human-readable paragraph). This is purely cosmetic — it doesn't influence the recommendations or numbers.

### 3. localStorage-First Data Flow

The audit form persists its state to `localStorage` under the key `ai-spend-audit-draft`. When the user completes the audit, the full report is written to `localStorage` under `audit-report`, and the user is redirected to `/results`.

```
Form State (localStorage)
    │
    ├── Step 1: Select tools → saved on each selection
    ├── Step 2: Configure plans → saved on each change
    └── Step 3: Team info → saved on input
    │
    ▼
runAudit(formData) → AuditReport
    │
    ▼
localStorage.setItem("audit-report", JSON.stringify(report))
    │
    ▼
router.push("/results")
    │
    ▼
ResultsDashboard reads from localStorage
```

**Why:**
- **No auth required** — users get value immediately without signing up.
- **Resilient** — closing the tab mid-form doesn't lose progress.
- **Simple** — no server state management for the core flow.

### 4. API Routes for Persistence (Optional)

Server-side API routes handle optional features:

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `POST /api/audit/save` | Save report to Supabase, generate share slug | No (rate-limited by IP) |
| `POST /api/ai-summary` | Generate Gemini narrative summary | No (rate-limited) |
| `POST /api/leads/capture` | Save email for follow-up | No |

All routes are rate-limited using IP hashing (hashed with a salt, never stored raw).

### 5. Shareable Reports via Slug

When a user saves their report, the server generates a nanoid-based slug (e.g., `V1StGXR8_Z5j`) and stores the full report JSON in Supabase. Anyone with the link `/r/V1StGXR8_Z5j` can view the report.

**Why not UUIDs?** Nanoid slugs are shorter, URL-safe, and easier to share verbally.

## Recommendation Engine Architecture

```
┌───────────────────────────────────────────────┐
│              runAudit(AuditFormData)            │
│                                                │
│  1. Build RuleContext from form data           │
│  2. Run all rules in parallel                  │
│  3. Flatten recommendations                    │
│  4. Sort by monthlySavings (descending)        │
│  5. Calculate spend breakdown                  │
│  6. Calculate health score                     │
│  7. Return AuditReport                         │
└───────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│           Rule Functions            │
│                                     │
│  ruleAnnualBilling     (billing)    │
│  ruleSeatReduction     (seats)      │
│  rulePlanDowngrade     (plan tier)  │
│  ruleConsolidateTools  (overlap)    │
│  ruleChatGptProAudit   (specific)   │
│  ruleApiOptimisation   (usage)      │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│         Calculator Module           │
│                                     │
│  effectiveMonthly()  — true cost    │
│  annualSwitchSavings() — delta      │
│  costOnPlan()        — plan lookup  │
│  buildSpendBreakdown() — totals     │
│  calculateHealthScore() — 0-100     │
└─────────────────────────────────────┘
```

### Adding a New Rule

1. Create a new exported function in `lib/engine/rules.ts` matching `RuleFunction` signature.
2. Add it to the `ALL_RULES` array in `lib/engine/recommendation-engine.ts`.
3. Write tests in `lib/engine/__tests__/engine.test.ts`.

No other files need to change. Rules are fully decoupled.

## Database Schema

```sql
-- Saved audit reports
audits (
  id            uuid PRIMARY KEY,
  slug          text UNIQUE,         -- shareable link
  team_name     text,
  team_size     int,
  tool_count    int,
  total_monthly numeric,
  total_savings numeric,
  health_score  int,
  report_json   jsonb,               -- full AuditReport
  ip_hash       text,                -- rate limiting
  created_at    timestamptz
)

-- Email leads
leads (
  id            uuid PRIMARY KEY,
  email         text,
  audit_id      uuid REFERENCES audits,
  source        text,                -- where they signed up
  created_at    timestamptz
)
```

Row Level Security is enabled. All reads are public (for shareable links). Writes are restricted to the API routes via the service role key.

## Performance Strategy

1. **Static pages** — Landing, audit, and results shells are statically generated at build time.
2. **Client-side hydration** — Interactive components (form, dashboard) hydrate on the client.
3. **Skeleton loading** — `DashboardSkeleton` provides immediate visual feedback during hydration.
4. **No unnecessary client JS** — Landing page sections are Server Components by default.
5. **Font optimisation** — Inter loaded via `next/font` with `display: swap`.

## Scaling to 10,000 Audits/Day

If the application were to scale to 10,000 audits per day, the following architectural shifts would be required:

### 1. Server-Side Recommendation Engine
Currently, the engine runs in the browser. While this is fast, it limits our ability to run complex cross-user benchmarks or keep pricing data secret.
- **Change**: Move `runAudit()` to an Edge Function (Next.js Middleware or Vercel Edge).
- **Why**: Allows for faster updates to pricing data without redeploying the frontend and enables server-side caching of results.

### 2. Global Pricing Cache (Redis)
Instead of bundling the pricing catalog in the JS bundle, we would move it to a high-performance global cache.
- **Change**: Implement Upstash Redis for tool pricing lookups.
- **Why**: Reduces the initial JS bundle size and allows for near-instant pricing updates across all global regions.

### 3. Asynchronous AI Processing
Generating Gemini summaries synchronously would hit rate limits and slow down the user experience at scale.
- **Change**: Move AI summary generation to a background job using a queue (e.g., Inngest or Upstash QStash).
- **Why**: Decouples the dashboard load from the AI API latency and allows for automatic retries on rate-limit failures.

### 4. Database Optimization
Supabase is robust, but 10k writes/day to the `audits` table would benefit from a more optimized write-ahead strategy.
- **Change**: Implement a buffer or use a time-series optimized storage for audit logs if we move beyond just "sharing" to "tracking spend over time."

### 5. Multi-Region Deployment
To maintain <100ms latency globally, we would deploy the frontend and Edge functions across all Vercel regions, with a distributed database or read-replicas.
