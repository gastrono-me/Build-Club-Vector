# Vector — Builder Experience Award (AABW)

Vector is an in-event toolkit for Agentic AI Build Week (Ho Chi Minh City, Jul 8–12), split into two modes for the two halves of the week:

**Pulse** — for Days 1–3 (workshops, networking, catchups): a live "Now" feed, a searchable session directory, a generated map of venues per day plus a build-day floor plan, an AI-matched people directory with in-app chat and 15-minute catchup scheduling, a personal schedule with conflict detection, and an AI copilot grounded in the event's own data.

**Line** ("Lock In, No Excuses") — for Days 4–5 (heads-down build + Demo Day): a Deadline Guardian (countdown + submission checklist + AI readiness review against the judging rubric), a Bottleneck Radar (live build blockers from other teams, with one tap into chat), and a Pitch Coach (practice timer + AI feedback on your Demo Day pitch).

None of this is a thin prompt wrapper — matchmaking, conflict checks, countdowns, and map state are all computed locally; the model is only called for the parts that genuinely need language understanding (matchmaking rationale, chat replies, readiness/pitch review), and every AI call has a local-logic fallback so the app never breaks if the call fails.

This build uses realistic mock data (sessions, attendees, build-day blockers) and generated/illustrative maps — there's no real venue floor plan yet. AI calls go through a tiny serverless proxy (`/api/claude`) so the API key never reaches the browser.

## Run it locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173. AI features fail over to the built-in local-logic fallbacks until the API key is set up below — the app is designed to degrade gracefully, never crash.

## Deploy it now (fastest path — Vercel CLI, no GitHub needed yet)

```bash
npm install -g vercel   # if you don't have it
vercel login            # opens a browser to authenticate
vercel                  # from inside this folder — accept the defaults
```

That gives a live preview URL in under a minute. Then wire up real AI calls:

```bash
vercel env add ANTHROPIC_API_KEY production
# paste your key from https://console.anthropic.com when prompted

vercel --prod           # redeploy with the key attached
```

You now have a public production URL for the Devpost submission. If you skip the API key for now, the app still works end to end — matchmaking, chat, readiness reviews, and pitch feedback all fall back to local logic instead of failing.

## Deploy it via GitHub + Vercel dashboard (if you also want a repo link)

1. Push this folder to a new GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Vector 1.0 — Builder Experience Award submission"
   git branch -M main
   git remote add origin https://github.com/<you>/vector-aabw.git
   git push -u origin main
   ```
2. On vercel.com → **Add New… → Project** → import that repo (Vercel auto-detects Vite).
3. In **Settings → Environment Variables**, add `ANTHROPIC_API_KEY`.
4. Click **Deploy** → you get a `*.vercel.app` URL.

Use that URL + the repo link for the Devpost submission.

## What's mocked vs real right now (1.0)

- Sessions, attendees, build-day blockers, and the city/floor-plan maps are realistic mock/generated data (`src/App.jsx`).
- Schedule, catchups, chat, blocker posts, and connections live in browser memory per visitor — not yet shared across devices.
- Matchmaking, chat replies, Bottleneck Radar summaries, the Deadline Guardian readiness review, and Pitch Coach feedback genuinely call Claude through `/api/claude`, each with a local-logic fallback.

Turning this into something real attendees share live (accounts, persisted data across devices, a real venue map) is the natural v2 — happy to scope that next if this places.
