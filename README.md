# EXECURE — The Behaviour Operating System for Traders

EXECURE helps traders build discipline through a structured pre-trade workflow: check your readiness, set your session plan, trade with rules visible, journal the outcome, and track your patterns over time.

## Features

- **Pre-Trade Check** — Customisable checklist with readiness scoring (0-100). Flags sessions below your threshold.
- **Session Plan Builder** — Lock your trading session, bias, max trades, and risk before you start. Stays visible all session.
- **Daily Journal** — Post-session debrief with emotional rating. Under 3 minutes. Feeds pattern analysis over time.
- **Discipline Streak Tracker** — GitHub-style heatmap showing rule compliance. Green/amber/grey with streak counters.
- **TradingView Chart** — Live chart embedded in the dashboard alongside your locked plan and readiness score.

## Tech Stack

- **Framework**: TanStack Start (React 19, TanStack Router)
- **Styling**: Tailwind CSS 4
- **Database**: Netlify Database (managed Postgres) via Drizzle ORM
- **Auth**: Netlify Identity
- **Charts**: TradingView embedded widget (free, no API key)
- **Deployment**: Netlify

## Getting Started

### Prerequisites
- Node.js 22+
- Netlify CLI (`npm i -g netlify-cli`)

### Local Development

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000`. Note: authentication only works when deployed to Netlify (Identity requires the `nf_jwt` cookie from a real deployment).

### Database Migrations

After changing `db/schema.ts`:

```bash
npx drizzle-kit generate
```

Migrations are applied automatically on deploy.

### Deploy

Push to your connected Git repository or use Netlify CLI:

```bash
netlify deploy --prod
```

## Project Structure

```
src/routes/         — File-based routes (TanStack Router)
src/components/     — Shared React components
src/lib/            — Auth utilities and context
src/server/         — Server functions (database CRUD)
src/middleware/      — TanStack Start middleware (auth)
db/                 — Drizzle ORM schema and client
netlify/functions/  — Netlify Functions (identity webhooks)
netlify/database/   — Auto-generated SQL migrations
```

## License

Proprietary. All rights reserved.
