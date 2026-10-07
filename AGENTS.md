# AGENTS.md

This document provides an overview of the EXECURE project structure for developers and AI agents.

## Project Overview

EXECURE is "The Behaviour Operating System for Traders" — a web application that helps traders build discipline through pre-trade checklists, session planning, journaling, and streak tracking. Built with TanStack Start on Netlify.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Database | Netlify Database (Postgres) via Drizzle ORM |
| Auth | Netlify Identity (@netlify/identity) |
| Charts | TradingView embedded widget |
| Language | TypeScript 5.9 (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
├── db/
│   ├── schema.ts           # Drizzle ORM table definitions
│   └── index.ts            # Database client initialization
├── drizzle.config.ts       # Drizzle Kit config (migrations → netlify/database/migrations)
├── netlify/
│   ├── database/
│   │   └── migrations/     # Auto-generated SQL migrations
│   └── functions/
│       └── identity-signup.ts  # Netlify Identity webhook (assigns default role)
├── src/
│   ├── components/
│   │   ├── CallbackHandler.tsx   # OAuth/email callback handler
│   │   ├── Navigation.tsx        # App navigation bar
│   │   └── TradingViewWidget.tsx # Embedded TradingView chart
│   ├── lib/
│   │   ├── auth.ts               # getServerUser server function
│   │   └── identity-context.tsx  # Client-side React auth context
│   ├── middleware/
│   │   └── identity.ts           # TanStack Start auth middleware
│   ├── server/
│   │   └── trading.functions.ts  # All CRUD server functions
│   ├── routes/
│   │   ├── __root.tsx            # Root layout (Identity + Callback wrappers)
│   │   ├── index.tsx             # Public landing page
│   │   ├── login.tsx             # Login page
│   │   ├── signup.tsx            # Signup page
│   │   ├── _app.tsx              # Protected layout (auth guard)
│   │   ├── _app.dashboard.tsx    # Main dashboard with TradingView
│   │   ├── _app.check.tsx        # Pre-Trade Check
│   │   ├── _app.session.tsx      # Session Plan Builder
│   │   ├── _app.journal.tsx      # Daily Journal
│   │   └── _app.history.tsx      # Discipline Streak Tracker
│   ├── router.tsx
│   └── styles.css                # Tailwind + EXECURE theme tokens
├── netlify.toml
├── tsconfig.json
└── vite.config.ts
```

## Key Architecture Decisions

### Authentication
- Netlify Identity handles all auth (signup, login, OAuth, password recovery)
- `_app.tsx` pathless layout enforces auth via `beforeLoad` + `getServerUser()`
- Client-side auth state managed via React context in `identity-context.tsx`
- Auth does NOT work on localhost — must deploy to test

### Database
- All tables defined in `db/schema.ts` using Drizzle ORM
- Tables: `checklist_templates`, `pre_trade_checks`, `session_plans`, `journal_entries`, `session_logs`
- All data is scoped by `userId` (Netlify Identity user ID)
- Migrations generated via `npx drizzle-kit generate` into `netlify/database/migrations/`
- Never run DDL directly — always use migration files

### Server Functions
- All database operations in `src/server/trading.functions.ts`
- Protected via `requireAuthMiddleware` — user is available in `context.user`
- Uses `.inputValidator()` (NOT `.validator()`) for input validation

### Routing
- `_app` prefix = pathless layout for protected routes
- `_app.dashboard.tsx` → `/dashboard`
- `_app.check.tsx` → `/check`
- Public routes: `/`, `/login`, `/signup`

## Development Commands

```bash
npm run dev      # Start Vite dev server on port 3000
npm run build    # Production build
```

## Conventions

- Components: PascalCase
- Server functions: camelCase, grouped in `.functions.ts` files
- Route files: TanStack Router file-based convention
- CSS: Tailwind utility classes + CSS custom properties for theme
- Database columns: snake_case strings, JS variables camelCase
