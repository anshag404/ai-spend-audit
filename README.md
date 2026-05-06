# AI Spend Audit

> Stop overpaying for AI tools your team barely uses.

[![CI](https://github.com/your-org/ai-spend-audit/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/ai-spend-audit/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-green)](https://supabase.com)

## Overview

AI Spend Audit is a SaaS tool that helps early-stage startups identify redundant AI subscriptions, detect underutilised seats, and surface concrete dollar savings — in under 60 seconds, with no integrations required.

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 15 (App Router)           |
| Language    | TypeScript 5                      |
| Styling     | Tailwind CSS v4                   |
| Components  | shadcn/ui                         |
| Database    | Supabase (PostgreSQL)             |
| Auth        | Supabase Auth                     |
| Animation   | Framer Motion                     |
| Forms       | react-hook-form + zod             |
| Deployment  | Vercel                            |

## Project Structure

```
ai-spend-audit/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (fonts, metadata, nav/footer)
│   ├── page.tsx            # Landing page (/)
│   ├── audit/              # /audit — start an audit
│   │   └── page.tsx
│   ├── results/            # /results — view results
│   │   └── page.tsx
│   └── globals.css         # Design system, tokens, utilities
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── home/               # Landing page sections
│   └── ui/                 # shadcn/ui primitives
├── config/
│   └── site.ts             # Central site configuration
├── lib/
│   ├── utils.ts            # Helper functions
│   └── supabase/           # Supabase client factories
│       ├── client.ts       # Browser client
│       └── server.ts       # Server client (RSC/Actions)
├── types/
│   ├── index.ts            # App-level TypeScript types
│   └── database.ts         # Supabase DB types (generated)
└── .github/
    └── workflows/
        └── ci.yml          # GitHub Actions CI pipeline
```

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/your-org/ai-spend-audit
cd ai-spend-audit
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase project URL and anon key (find these in your Supabase dashboard under **Project Settings → API**).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script           | Description                          |
|------------------|--------------------------------------|
| `npm run dev`    | Start development server (Turbopack) |
| `npm run build`  | Production build                     |
| `npm run start`  | Start production server              |
| `npm run lint`   | Run ESLint                           |
| `npm run type-check` | TypeScript type-checking        |
| `npm run format` | Format all files with Prettier       |

## Development Roadmap

This project is built over 7 days:

| Day | Focus |
|-----|-------|
| **1** ✅ | Foundation, design system, landing page, placeholder routes |
| 2   | Supabase schema, auth, audit form (react-hook-form + zod) |
| 3   | Audit engine core logic, tool database |
| 4   | Results dashboard, data visualisation |
| 5   | AI recommendations (OpenAI) |
| 6   | Share URLs, PDF export, analytics |
| 7   | Polish, error states, tests, deployment |

## Environment Variables

See [`.env.example`](./.env.example) for all required variables.

## Contributing

This is a solo internship project. PRs welcome after Day 7.

## License

MIT
