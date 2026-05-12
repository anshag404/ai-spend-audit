# Development Log

> 7-day build diary for AI Spend Audit.

## Day 1 — Foundation

**Goal:** Get a deployable skeleton with a polished landing page.

**What I built:**
- Next.js 16 project with App Router and Turbopack
- Full design system in `globals.css` (CSS custom properties, colour tokens, spacing scale)
- Dark-mode-first aesthetic with gradient accents
- Landing page with Hero, How-it-works, and CTA sections
- Responsive Navbar with mobile hamburger menu
- Footer with navigation links
- Placeholder routes for `/audit` and `/results`
- GitHub repository and initial CI setup

**Key decisions:**
- Went with Tailwind v4 over v3 for native CSS variable theming
- Chose shadcn/ui for accessible primitives without framework lock-in
- Dark mode only — simpler to ship, matches the developer audience

**Time spent:** ~6 hours

---

## Day 2 — Database & Form

**Goal:** Build the multi-step audit input experience.

**What I built:**
- Supabase project setup with PostgreSQL
- Database schema (`audits` table, `leads` table) with Row Level Security
- Multi-step audit form (3 steps: Select Tools → Configure → Team Info)
- Tool selector grid with visual cards and category grouping
- react-hook-form integration with Zod validation
- localStorage persistence for form drafts (survives page refresh)
- `.env.example` with all required variables documented

**Key decisions:**
- Chose localStorage over Supabase for form drafts — no auth required, instant persistence
- 3-step form instead of single page — less cognitive load, higher completion rates
- Zod for validation — type inference means validation and TypeScript types stay in sync

**Time spent:** ~7 hours

---

## Day 3 — Audit Engine

**Goal:** Build the core recommendation engine.

**What I built:**
- AI tool pricing catalog (10 tools, 30+ plans with real pricing data)
- Financial calculator module (`effectiveMonthly`, `annualSwitchSavings`, `costOnPlan`)
- 6 recommendation rules:
  1. Annual billing switch
  2. Excess seat reduction
  3. Plan downgrade
  4. Tool consolidation
  5. ChatGPT Pro audit
  6. API cost optimisation
- Recommendation engine orchestrator with conflict resolution
- Health score algorithm (0-100 composite score)
- Spend breakdown calculator (totals, per-seat, per-member, top spender)
- Type definitions for the full report structure

**Key decisions:**
- Rules are pure functions — no side effects, easy to test, easy to add new ones
- No LLMs for recommendations — every number is traceable math
- Engine runs client-side for instant results and data privacy

**Time spent:** ~8 hours (most complex day)

---

## Day 4 — Results Dashboard

**Goal:** Build a premium results experience.

**What I built:**
- Savings hero section with animated counters
- Recommendation cards with expandable detail (cost comparison, actions, tradeoffs)
- Tool-by-tool spend breakdown table
- Spend distribution chart
- Share panel with social sharing (Twitter, LinkedIn, copy link)
- API route to save audits to Supabase with nanoid slugs
- Shareable report page (`/r/[slug]`)
- Empty state and loading states

**Key decisions:**
- Framer Motion for card animations — adds perceived quality
- Expandable cards over separate pages — keeps context, reduces navigation
- nanoid slugs over UUIDs — shorter, cleaner URLs for sharing

**Time spent:** ~7 hours

---

## Day 5 — AI Summaries & Lead Gen

**Goal:** Add the AI-powered narrative layer and email capture.

**What I built:**
- Gemini API integration for narrative report summaries
- AI summary component with loading/error/empty states
- Email lead capture API route
- Lead storage in Supabase with audit association
- Rate limiting via IP hash (salted, never stored raw)
- Resend integration for transactional emails

**Key decisions:**
- AI summary is optional and cosmetic — it doesn't change the numbers
- Email capture happens after value delivery — user sees the report first
- IP hashing for rate limiting — privacy-conscious, no raw IP storage

**Time spent:** ~5 hours

---

## Day 6 — Testing & Quality

**Goal:** Make it production-grade.

**What I built:**
- 40 unit tests with Vitest (calculator, rules, engine integration, schema validation)
- GitHub Actions CI pipeline (lint → type-check → test → build)
- Accessibility improvements:
  - Semantic HTML (`<main>`, `<nav>`, `<article>`, `<ol>`)
  - ARIA attributes (`aria-expanded`, `aria-controls`, `aria-pressed`)
  - Focus management (auto-focus on step navigation)
  - Keyboard navigation for all interactive elements
- DashboardSkeleton for perceived performance
- ErrorState reusable component
- PostHog analytics integration with conditional initialisation
- Dead code cleanup

**Key decisions:**
- Test the engine, not the UI — business logic is where bugs matter most
- eslint-disable for legitimate patterns (setState in hydration effect) over refactoring
- PostHog only initialises when keys are present — graceful degradation

**Time spent:** ~5 hours

---

## Day 7 — Documentation & Polish

**Goal:** Launch-ready documentation and final polish.

**What I built:**
- Complete README rewrite with problem/solution narrative
- Architecture documentation with system diagrams
- Development log (this file)
- Go-to-market strategy
- Unit economics analysis
- Testing strategy documentation
- Pricing data documentation
- Key metrics framework
- Build retrospective
- Final SEO pass
- UI consistency audit
- Missing webmanifest fix

**Time spent:** ~4 hours

---

## Total Build Time

~42 hours over 7 days.

## Lines of Code (Approximate)

| Category | Files | Lines |
|----------|-------|-------|
| Engine (rules, calculator, types) | 5 | ~1,200 |
| Components (UI) | 18 | ~2,800 |
| API Routes | 3 | ~300 |
| Config (pricing, site) | 4 | ~400 |
| Tests | 3 | ~600 |
| Styles | 1 | ~300 |
| Docs | 9 | ~1,500 |
| **Total** | **~43** | **~7,100** |
