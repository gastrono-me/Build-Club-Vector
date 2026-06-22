# Vector

Vector is an in-event toolkit for Agentic AI Build Week (AABW, Ho Chi Minh City). It splits into two modes for the two halves of the week, so a builder only sees the tools that matter right now.

**Pulse** (networking and discovery)
- **Now**: a live feed driven by the event clock, showing what is on now and what is up next.
- **Discover**: the event calendar in one place, filterable by day.
- **People**: browse everyone here and filter by skills, industries, and what they are looking for, with free-text keyword search. You decide who to reach out to; there is no opaque ranking.
- **Maps**: per-day venue maps plus a build-day floor plan (illustrative).
- **My schedule**: save sessions; clashes are flagged automatically.
- **Ask Clawbie**: a placeholder for Build Club's own assistant (integration is a later step).

**Line** (heads-down build and Demo Day)
- **Deadline Guardian**: a countdown, a submission checklist mirroring the real DevPost fields, and a readiness self-check on your write-up.
- **Bottleneck Radar**: a shared, live feed of where builders are stuck. Post a blocker, hit "me too" on someone else's, and watch the counts update in real time across everyone signed in. In a room of a thousand builders, you are never stuck alone.

## What is real vs mock

- **Real and persisted**: accounts (email magic-link, plus Google and GitHub when configured), your profile, your saved schedule, your checklist state, and the Bottleneck Radar feed (live across users via Supabase Realtime).
- **Mock seed data**: the session calendar, the people directory's example attendees, and the maps. Signed-in users appear in People alongside the seed.
- **AI**: the readiness check runs on local logic. Connecting a live model is a later, funded step; there is no token spend in this build.

## Stack

Next.js (App Router) + Supabase (Postgres, Auth, Realtime, Row-Level Security), deployed on Vercel.

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill in the Supabase values
npm run dev
```

Open http://localhost:3000. You need a Supabase project with the schema applied (see `db/migrations/` and `db/seed.sql`) and these values in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your publishable / anon key>
```

Email magic-link sign-in works with no extra setup. Google and GitHub sign-in require registering OAuth apps in those providers' consoles and adding the credentials in the Supabase dashboard.

## Tests

```bash
npm run test
```

Unit tests cover the deterministic logic (time helpers, schedule conflicts, keyword search, readiness review).

## Deploy

Deployed on Vercel via the CLI: `vercel --prod` from the repo root. Before deploying, know the gotchas (full list in `CLAUDE.md` → "Deploy gotchas") — they will bite otherwise:

- The Vercel project framework **must** be Next.js. It's pinned in `vercel.json`; if it reverts to another preset, every route 500s/404s despite a green build.
- The Edge middleware (`lib/supabase/middleware.ts`) is intentionally dependency-free — do not import `@supabase/ssr` there (it fails to initialise in Vercel's Edge runtime).
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project (Production + Preview).
- Add the deployed URL to Supabase Auth → URL Configuration so magic-link/OAuth redirects resolve.

See `docs/ARCHITECTURE.md` for the system map and `docs/ROADMAP.md` for what's left.
