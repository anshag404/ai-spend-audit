# AI Spend Audit

AI Spend Audit is a free, no-login web application that helps startups identify overspending in their AI tool stack. By analyzing subscriptions for tools like Cursor, ChatGPT, and OpenAI API, it provides a prioritized savings report with actionable recommendations in under 60 seconds.

[**Live Demo →**](https://ai-spend-audit-seven-lime.vercel.app/)

## Screenshots

![Hero Section](https://via.placeholder.com/800x450?text=Hero+Section+Screenshot)
*The landing page featuring a high-fidelity dashboard preview.*

![Audit Form](https://via.placeholder.com/800x450?text=Audit+Form+Screenshot)
*The multi-step audit form with tool selection and configuration.*

![Results Dashboard](https://via.placeholder.com/800x450?text=Results+Dashboard+Screenshot)
*The final savings report with prioritized recommendations and spend analysis.*

[![CI](https://github.com/anshag404/ai-spend-audit/actions/workflows/ci.yml/badge.svg)](https://github.com/anshag404/ai-spend-audit/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-green)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## The Problem

Early-stage startups bleed $200–600/mo on overlapping AI tools nobody fully uses. Teams stack ChatGPT Plus *and* Claude Pro *and* Gemini Advanced, pay for 10 Cursor seats when only 4 devs write code, and stay on monthly billing when annual saves 20%.

There's no quick way to audit this. Finance teams spreadsheet it. Engineering ignores it. The money leaks.

## The Solution

**AI Spend Audit** is a free, no-login tool that takes your team's AI subscriptions as input and outputs a prioritised savings report in under 60 seconds. No OAuth. No integrations. No credit card.

### How It Works

1. **Select your tools** — Pick from 10+ supported AI tools across coding assistants, chat platforms, and API services.
2. **Configure plans & seats** — Set billing cycles, seat counts, and monthly spend for each tool.
3. **Get your report** — Receive ranked recommendations with specific dollar savings, confidence levels, and tradeoff analysis.

### What the Engine Detects

| Rule | Example |
|------|---------|
| 🔄 **Annual billing switch** | "Switch Cursor Pro to annual → save $48/yr per seat" |
| 💺 **Excess seat reduction** | "You have 10 Copilot seats for a team of 5 → cut 5 seats" |
| 📉 **Plan downgrade** | "Copilot Business on a 2-person team → switch to Pro" |
| 🔗 **Tool consolidation** | "You're paying for both Cursor and Copilot for code → consolidate" |
| ⚠️ **ChatGPT Pro audit** | "ChatGPT Pro ($200/mo) is rarely justified → downgrade to Plus" |
| ⚡ **API cost optimisation** | "OpenAI API at $200/seat/mo is high → audit token usage" |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router, Turbopack) | Server components, file-based routing, edge-ready |
| Language | TypeScript 5 | Type safety across client/server boundary |
| Styling | Tailwind CSS v4 | Rapid, consistent dark-mode UI |
| Components | shadcn/ui | Accessible primitives, no vendor lock-in |
| Database | Supabase (PostgreSQL) | Auth, real-time, Row Level Security |
| Animation | Framer Motion | Performant layout animations |
| Forms | react-hook-form + Zod | Declarative validation, type inference |
| Analytics | PostHog | Event tracking, funnel analysis |
| Email | Resend | Transactional emails |
| AI | Google Gemini | Optional narrative summaries on reports |
| Testing | Vitest | Fast unit testing with TS support |
| CI | GitHub Actions | Automated lint, type-check, test, build |

## Project Structure

```
ai-spend-audit/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, SEO, PostHog)
│   ├── page.tsx                  # Landing page (/)
│   ├── audit/page.tsx            # Multi-step audit form (/audit)
│   ├── results/page.tsx          # Results dashboard (/results)
│   ├── r/[slug]/page.tsx         # Shareable report links (/r/abc123)
│   └── api/
│       ├── audit/save/route.ts   # Save audit to Supabase
│       ├── ai-summary/route.ts   # Gemini narrative summary
│       └── leads/capture/route.ts # Email lead capture
├── components/
│   ├── audit/                    # Form orchestrator, tool selector, entry cards
│   ├── results/                  # Dashboard, savings hero, charts, share panel
│   ├── home/                     # Landing page sections
│   ├── layout/                   # Navbar, Footer
│   ├── providers/                # PostHog provider
│   └── ui/                       # shadcn/ui primitives + ErrorState
├── config/
│   └── pricing/                  # AI tool catalog (10+ tools, 30+ plans)
├── lib/
│   ├── engine/                   # Recommendation engine (rules, calculator)
│   ├── schemas/                  # Zod validation schemas
│   ├── hooks/                    # Custom React hooks
│   ├── supabase/                 # Client/server factories
│   └── utils.ts                  # Shared helpers
├── types/                        # TypeScript type definitions
├── test/                         # Test setup
├── supabase/                     # Migration files
├── public/                       # Static assets
└── .github/workflows/ci.yml     # CI pipeline
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/anshag404/ai-spend-audit
cd ai-spend-audit
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your keys:
- **Supabase**: URL + anon key from Project Settings → API
- **Gemini**: API key from [aistudio.google.com](https://aistudio.google.com)
- **Resend**: API key from [resend.com](https://resend.com) (optional, for emails)
- **PostHog**: Project key from [posthog.com](https://posthog.com) (optional, for analytics)

### 3. Run the database migrations

Apply the schema to your Supabase project from `supabase/migrations/`.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run type-check` | TypeScript type-checking |
| `npm run test` | Run test suite (Vitest) |
| `npm run test:watch` | Watch mode for tests |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting |

## Development Timeline

| Day | Focus | Status |
|-----|-------|--------|
| 1 | Foundation, design system, landing page | ✅ |
| 2 | Database schema, auth, audit form | ✅ |
| 3 | Audit engine, pricing catalog, rules | ✅ |
| 4 | Results dashboard, visualisations, sharing | ✅ |
| 5 | AI summaries, email capture, lead gen | ✅ |
| 6 | Testing, accessibility, CI, performance | ✅ |
| 7 | Documentation, polish, deployment | ✅ |

## Testing

```bash
npm test
```

40 tests across 2 test files covering:
- Financial calculator functions (effectiveMonthly, annualSwitchSavings)
- Individual recommendation rules (6 rules)
- Full engine integration (end-to-end report generation)
- Edge cases (zero spend, single tool, team of 1)
- Schema validation (Zod form validation)

## Environment Variables

See [`.env.example`](./.env.example) for all required and optional variables.

## Decisions

1. **Client-Side Engine over Server-Side**: I chose to run the recommendation logic entirely in the browser using TypeScript math. This ensures zero latency for the user, absolute data privacy (spend data never leaves the browser unless shared), and zero server compute costs for the core product.
2. **Deterministic Rules over LLM Logic**: Recommendations are produced by rule-based functions, not AI. This ensures 100% accuracy and defensibility of financial advice. AI is used only for cosmetic narrative summaries, keeping the core value proposition reliable.
3. **localStorage for Persistence**: Form drafts are saved to `localStorage` instead of a database. This allows users to start, stop, and refresh the audit without needing to create an account, maximizing conversion while still providing a resilient experience.
4. **Dark Mode Only**: I opted for a dark-mode-first aesthetic to save design and development time. Given the target audience (developers and startup founders), dark mode is the standard preference, allowing me to focus on high-quality gradients and typography.
5. **PostHog for Analytics**: I integrated PostHog early to track the conversion funnel (Form Step 1 -> Results -> Lead Capture). This decision allows for data-driven decisions on where users drop off, which is critical for an MVP's growth.

## Docs

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture and design decisions |
| [DEVLOG.md](./DEVLOG.md) | Daily development log |
| [TESTS.md](./TESTS.md) | Testing strategy and coverage |
| [PRICING_DATA.md](./PRICING_DATA.md) | AI tool pricing data sources |
| [GTM.md](./GTM.md) | Go-to-market strategy |
| [ECONOMICS.md](./ECONOMICS.md) | Unit economics and funnel math |
| [METRICS.md](./METRICS.md) | Key metrics and KPIs |
| [REFLECTION.md](./REFLECTION.md) | Build retrospective |
| [USER_INTERVIEWS.md](./USER_INTERVIEWS.md) | User interview notes |
| [LANDING_COPY.md](./LANDING_COPY.md) | Landing page copywriting |
| [PROMPTS.md](./PROMPTS.md) | AI prompt engineering |

## License

MIT

---

Built in 7 days as a SaaS MVP sprint. [View the devlog →](./docs/DEVLOG.md)
