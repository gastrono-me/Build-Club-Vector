# Vector

Vector is an in-event toolkit for **Agentic AI Build Week** (AABW, Ho Chi Minh City, Jul 8 to 12). It splits into two modes for the two halves of the week, so a builder only ever sees the tools that matter right now.

**Pulse** (Days 1 to 3, networking and discovery)
- A live "Now" feed driven by the event clock: what is happening now and what is up next.
- A searchable session directory.
- A generated per-day map of venues plus a build-day floor plan.
- A people directory: browse everyone here, filter by skills, industries, and what they are looking for, then connect, chat, or lock in a 15-minute catchup.
- A personal schedule with conflict detection.
- An AI copilot grounded in your own event data (your saved sessions, catchups, and profile).

**Line** (Days 4 to 5, "Lock In, No Excuses")
- A Deadline Guardian: a countdown, a submission checklist mirroring the real DevPost fields, and an AI readiness review against the judging rubric.
- A Bottleneck Radar: build blockers other teams are stuck on, grouped by theme, with one tap into chat.

## How the AI works (and an honest note for this build)

Vector is not a thin prompt wrapper. Everything that can be computed is computed locally: matchmaking signals, schedule conflicts, the countdown, and map state are all plain JavaScript. The model is only used for language: chat replies, the copilot answer, and the readiness and blocker summaries.

**In this build, those language features run on their local-logic fallbacks.** Every AI call is wrapped so that if the model is unavailable the app falls back to deterministic local logic instead of failing. The app loads, runs, and demos end to end with no API key and no token spend. Wiring real model calls is a funded next step (see below), not a requirement to try it.

A serverless proxy (`api/claude.js`) is included so that, when real calls are turned on, the Anthropic API key stays server-side and never reaches the browser. The frontend is not yet pointed at it; that wiring and a funded key are the next step.

## Run it locally

```bash
npm install
npm run dev
```

Opens at http://127.0.0.1:5173. AI features use the built-in local-logic fallbacks; the app is designed to degrade gracefully and never crash.

## Deploy on Vercel (GitHub import)

1. Push this branch to GitHub (already on `github.com/gastrono-me/Build-Club-Vector`).
2. On vercel.com: **Add New… → Project** → import the repo. Vercel auto-detects Vite (build `vite build`, output `dist/`); no config needed.
3. Click **Deploy**. You get a `*.vercel.app` URL in about a minute.

No environment variables are required: the app runs entirely on local fallbacks. (`ANTHROPIC_API_KEY` only matters once the proxy is wired and real model calls are funded.)

Use that URL for the DevPost "Try it" link.

## What is mock vs real (this build)

- Sessions, attendees, build-day blockers, and the city and floor-plan maps are realistic mock and generated data (`src/App.jsx`).
- Schedule, catchups, chat, blocker posts, and connections live in browser memory per visitor; they are not shared across devices yet.
- The event clock is a user-controlled simulation (a day selector plus a time slider), so "Now", countdowns, and "live" states can be demoed at any moment.
- AI language features run on local fallbacks (see the note above).

## What's next

Turning Vector into something attendees share live is the natural next step: accounts and a database so profiles and the blocker feed persist across devices, a live event calendar sourced from the real schedule, keyword search across people, and an organizer view of where builders are getting stuck. That work is scoped in `docs/ROADMAP.md`.
