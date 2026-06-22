# Vector — architecture

A Next.js (App Router) + Supabase app. Deterministic logic is pure TypeScript in `lib/`; persistence and realtime are Supabase; the look is a token-driven design system. Persistence is concentrated: only profiles, saved schedule, checklist state, and the blocker feed hit the database — everything else (events, people directory seed, maps) is mock data behind a single data seam.

## Two modes, one shell
`components/shell/AppShell.tsx` wraps every page (except `/login` and `/auth/callback`, which render bare). Mode is derived from the path:

- **Pulse:** `/` Now · `/discover` Calendar · `/people` Directory · `/maps` · `/schedule` · `/clawbie` (placeholder)
- **Line:** `/deadline` Deadline Guardian · `/radar` Bottleneck Radar (the hero)

`TopBar` carries the wordmark, the **SimClock** (a user-controlled day+time simulation — `lib/hooks/useSimClock.tsx`), and the Pulse/Line toggle. `Nav` is a left rail on desktop, bottom bar on mobile.

## Auth
- Sign-in: Supabase email **magic-link** (`app/login`), plus Google/GitHub OAuth buttons (need provider setup — see ROADMAP). `app/auth/callback/route.ts` exchanges the code for a session.
- **Route gate:** `middleware.ts` → `lib/supabase/middleware.ts`. It is deliberately **dependency-free** (no `@supabase/ssr` import — that crashes Vercel's Edge runtime). It redirects to `/login` when the Supabase auth cookie is absent. This is a UX gate only; **RLS is the real security boundary.** The browser client (`lib/supabase/client.ts`) auto-refreshes the session.

## Data model (Supabase, see `db/migrations/`)
| Table | Keys / shape | RLS | Realtime |
|---|---|---|---|
| `profiles` | `id` = `auth.users.id`; name, occupation, org, tagline, bio, skills[], industries[], looking[], links jsonb, avatar_url | authed read all; write own. A trigger auto-creates a blank row on signup. | — |
| `blockers` | id, author_id (nullable = community/seed), category, note, created_at | authed read all; insert/delete own | ✅ |
| `blocker_metoo` | (blocker_id, user_id) PK | authed read all; insert/delete own | ✅ |
| `saved_sessions` | (user_id, session_id) PK | own only | — |
| `checklist_state` | (user_id, item_id, checked) | own only | — |
| Storage `avatars` | public bucket | authed upload | — |

Migrations `001`–`004` + `seed.sql` are idempotent; apply in order in the Supabase SQL editor (or via the Management API). `seed.sql` inserts a few authorless "community" starter blockers so the Radar feed is never empty. **Realtime** is enabled by `002_radar.sql` adding `blockers` + `blocker_metoo` to the `supabase_realtime` publication; if the live "me too" updates don't fire, confirm Realtime is on for those tables in Supabase → Database → Replication.

## The hero: `components/radar/EmbeddingPlot.tsx`
A 2D "embedding field" plot of the live blocker feed. Each blocker is a node positioned so same-category blockers cluster (category → anchor + deterministic per-id jitter); node radius scales with its "me too" count; tapping a node selects it and "me too" draws connecting vectors to neighbours. It reads live data from `useRadar()` (which refetches on Supabase Realtime changes), so it updates across all signed-in clients. `RadarFeed` renders the heading + plot + `PostBlocker` composer + a `BlockerCard` list below for legibility/accessibility.

## Code map
```
app/                  routes (see modes above) + api/claude (keyless proxy stub) + middleware.ts
components/
  shell/   AppShell TopBar SimClock Nav ModeToggle Avatar
  ui/      Button Card Tag SectionTitle Input Modal   (design-system primitives)
  radar/   EmbeddingPlot RadarFeed BlockerCard PostBlocker
  people/ discover/ schedule/ deadline/ now/ maps/ clawbie/ profile/
lib/
  supabase/{client,server,middleware}.ts
  time.ts schedule.ts match.ts search.ts   (pure, unit-tested)
  ai/local-fallbacks.ts                      (AI fallbacks; no model calls)
  data/{sessions,attendees,days,venues,blocker-tags}.ts + useEventData.ts  (mock seam)
  design/tokens.ts                           (the whole look)
  hooks/{useSimClock,useProfile,useRadar,useSavedSchedule,useChecklist}.ts
types/index.ts        Profile, Session, Attendee, Day, Venue, BLOCKER_TAGS, ALL_TAGS, INDUSTRIES, LOOKING
db/migrations/*.sql + db/seed.sql
```

## Design system (`lib/design/tokens.ts` + `app/globals.css`)
"Embedding field / architect plotter on paper." Tune everything from `tokens.ts`; `globals.css` mirrors the values as CSS variables; primitives consume them.
- **Color:** paper `#EEF1F4`, ink `#14143C`, vector-blue accent `#2B2BF5` (used with restraint), oxblood `#8A2233`, graphite `#5A5F6B`.
- **Type:** Fraunces (display, italic accent), IBM Plex Sans (body), IBM Plex Mono (uppercase tracked labels/data) — wired via `next/font` in `app/layout.tsx`.
- **Devices:** faint 32px plotter grid on the page; 1.5px ink borders; hard offset shadow `6px 6px 0 rgba(20,20,60,.08)` (not soft blur); ink-fill active states.

## Mock vs real
Real/persisted: auth, profiles, saved schedule, checklist, the Bottleneck Radar feed. Mock/seeded (via `useEventData`): sessions, attendees, maps. AI: local fallbacks only. The `useEventData()` seam is the single swap point if/when real event data is wired in.
