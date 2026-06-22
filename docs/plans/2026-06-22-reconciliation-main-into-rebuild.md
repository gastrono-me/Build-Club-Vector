# Reconciliation Plan — absorb `main`'s backend features into `rebuild-v0` (Supabase)

**Date:** 2026-06-22
**Status:** Draft for review (one flagged decision below)
**Foundation (locked):** `rebuild-v0` (Next.js 14 + Supabase), deployed on Vercel. Supabase is the single data/auth/realtime/storage layer.
**Coordination:** none required (owner confirmed).

## Why this plan exists

While `rebuild-v0` work was underway, `origin/main` advanced 4 commits (Jason, 2026-06-22) turning the old Vite prototype into a real app: Google OAuth + cookie sessions, Vercel KV persistence, **real cross-user chat via Ably**, bell notifications, Luma sign-up buttons, and a "real users only" directory. The original plan (restore old-main features, then overwrite `main`) was scoped against a stale `main` and its cutover would have destroyed that work.

Decision: keep `rebuild-v0` + Supabase as the foundation (one backend vs `main`'s KV + Ably + Google-OAuth + cookie-session sprawl) and **absorb `main`'s new capabilities onto Supabase**. Supabase natively replaces all three external services `main` bolted together:

| `main` piece | Supabase equivalent |
|---|---|
| Vercel KV (blob persistence) | Postgres tables (already in use) |
| Ably (real-time chat) | Supabase Realtime (already powers the Radar) |
| Google OAuth + hand-written cookie sessions (`api/auth.js`, `_lib/session.js`) | Supabase Auth Google provider (buttons already wired) |
| `api/notifications.js` + KV read-state | Postgres `message_reads` + Realtime |

## Locked decisions
1. Foundation = `rebuild-v0` + Supabase on Vercel.
2. Chat becomes **genuine cross-user DMs** (Supabase `messages` table + Realtime), **replacing the roleplay chat** built in Tasks 5–6. The roleplay logic (`localChatReply`, `openingLine`, the `chat_messages` table from `005`) is retired.
3. No Ably, no Vercel KV, no hand-rolled sessions. Everything on Supabase.
4. `main`'s KV data is demo/test only — **no data migration** (fresh Supabase is canonical).

## FLAGGED DECISION (confirm on review) — mock attendees in the directory

`main` removed mock attendees ("real users only"). `rebuild-v0`'s People directory currently shows real Supabase profiles **plus** ~12 mock attendees (seed for demo richness). Real cross-user DMs only work between real signed-in users.

- **Recommended:** **keep mock attendees as directory seed** so the demo isn't empty, but enable **Message/DM only for real users**; **Connect and Catchup still work for mock attendees** (those are self-owned — your connection list / your calendar — and don't need the other party to act). Roleplay chat is removed entirely (per locked decision 2); a mock attendee simply has no Message button.
- **Alternative:** match `main` exactly — drop mock attendees, real users only. Cleaner model, emptier demo until people sign up.

Everything else proceeds the same either way; this only changes directory composition + which cards show a Message button.

## New data model — migration `006_messaging.sql`

Idempotent, in the `001`–`005` style. Real cross-user direct messages + unread tracking, RLS-scoped, Realtime-enabled.

| Table | Shape | RLS |
|---|---|---|
| `messages` | `id uuid pk`, `sender_id uuid → auth.users`, `recipient_id uuid → auth.users`, `body text`, `created_at` | **select** where `auth.uid() IN (sender_id, recipient_id)`; **insert** where `auth.uid() = sender_id` |
| `message_reads` | `(user_id uuid, other_id uuid) pk`, `last_read_at timestamptz` | all own only (`auth.uid() = user_id`) |

Realtime: add `messages` to the `supabase_realtime` publication (same pattern as `002_radar.sql`). Index `messages (sender_id, recipient_id, created_at)` and a mirror for inbox queries. Drop nothing; the `005` `chat_messages`/roleplay tables are left in place (harmless) and simply stop being used.

**Conversation identity:** a conversation is the unordered pair `{a,b}`; queries fetch `messages WHERE (sender_id=me AND recipient_id=other) OR (sender_id=other AND recipient_id=me) ORDER BY created_at`. Unread for a conversation = `messages WHERE recipient_id=me AND sender_id=other AND created_at > last_read_at`.

## Impact on existing work (Tasks 1–8)

- **Kept as-is:** Pitch Coach, Ask Clawbie, catchups, connections, Now nudge, DevPost link, all pure-logic + migration `005` tables for catchups/connections/submissions.
- **Refactored:** `ChatModal` (Task 5) — its UI is reused, but the data layer swaps from roleplay (`useChat` → `chat_messages`) to real DMs (`useDirectMessages` → `messages` + Realtime). `SocialProvider` opens DMs with real users.
- **Retired:** `lib/hooks/useChat.ts` (roleplay), `localChatReply`/`openingLine` usage, and the `chat_messages` write path. Files may be deleted or left dead; plan deletes them for cleanliness.
- **Improved:** the Radar "Message" button (Task 7) now opens a **real DM** with the blocker's author (a real user) — exactly what it should be; previously it would have opened a name-only roleplay.

## Phased tasks

### R1 — Migration 006 + messaging hooks
- Create `db/migrations/006_messaging.sql` (tables + RLS + Realtime + indexes above).
- `lib/hooks/useDirectMessages.ts`: `(otherUserId) → { thread, send(body), loading }`. Loads the pair's messages, inserts on send (sender_id=auth.uid), subscribes to Realtime for new rows in either direction, dedupes optimistic vs realtime echo.
- `lib/hooks/useInbox.ts`: `() → { conversations, totalUnread, markRead(otherId) }`. Builds the conversation list (distinct partners + last message + unread count via `message_reads`), subscribes to Realtime on `messages` where `recipient_id=auth.uid()` to bump unread live, `markRead` upserts `message_reads.last_read_at=now()`.
- Apply `006` to the Supabase project (Management API, as `005` was) and verify tables/Realtime.

### R2 — Real DM UI (replace roleplay)
- Refactor `components/people/ChatModal.tsx` to consume `useDirectMessages(person.realUserId)` instead of `useChat`; remove the opener-seed/roleplay path.
- `SocialProvider`: `openChat` now targets a real user id; gate the People/Radar Message action to real users (per the flagged directory decision).
- Delete `lib/hooks/useChat.ts`; remove `localChatReply`/`openingLine` (and their tests). Leave `chat_messages` table unused.

### R3 — Bell notifications
- Add a bell to `components/shell/TopBar.tsx` (between `ModeToggle` and the profile `Avatar` link, line ~65): unread badge (cap 9+) from `useInbox().totalUnread`, dropdown listing conversations (avatar, name, last message, unread dot), click → open DM + `markRead`. Live via the `useInbox` Realtime subscription.

### R4 — Google OAuth enablement
- Enable the Google provider in Supabase (client id/secret via dashboard or Management API auth config) and add the deployed + localhost callback to the redirect allow-list. `app/login/page.tsx` already calls `signInWithOAuth('google')`; verify the round-trip and `app/auth/callback`.
- Seed `profiles.avatar_url` from the Google picture on first sign-in (extend the `handle_new_user` trigger to read `raw_user_meta_data->>'avatar_url'`/`'picture'`, or set it on first profile load).

### R5 — Luma sessions
- Add `lumaUrl?: string` to the `Session` type (`types/index.ts`) and populate it on the mock sessions (`lib/data/sessions.ts`).
- Add a Luma sign-up button on `components/discover/SessionCard.tsx` (link out, `target="_blank"`), shown when `lumaUrl` is present. (Sessions stay mock behind `useEventData`; this is just the link-out `main` added.)

### R6 — Directory alignment
- Implement the flagged decision: keep mock attendees as seed with Message disabled for them (recommended), or remove mock attendees entirely. Connect/Catchup behavior unchanged.

### R7 — Verify end-to-end (two real accounts)
- Two signed-in users (two browsers): user A messages user B → B sees it live + bell increments → B opens, unread clears, reply reaches A live. Confirm persistence across refresh and RLS (A cannot read C's messages).
- Google sign-in round-trip; avatar from Google picture.
- Radar Message opens a real DM with the author; Luma buttons link out; catchups/connections/pitch/clawbie still work.
- `npm run test` + `npm run build` green.

### R8 — Cutover `rebuild-v0` → `main` (deliberate, gated)
- This now **replaces** `main` (Jason's work is superseded by the absorbed-onto-Supabase version, per owner decision). Before cutover, confirm every `main` capability is present in `rebuild-v0`: cross-user chat ✅, notifications ✅, Google OAuth ✅, Luma link-outs ✅, real-user directory ✅ (plus rebuild's Radar hero, design system, tests).
- Mechanics: because histories are unrelated, snapshot `main` first (tag `main-vite-archive` at `0288d51` so Jason's Vite app stays recoverable), then make `main` point to the finished `rebuild-v0` via a reviewable merge (`--allow-unrelated-histories`, tree resolved to `rebuild-v0`). Verify `git diff main rebuild-v0` is empty. **Gated on explicit go-ahead; no push without it.**

## Verification gates
- `006` applied + tables/Realtime confirmed before R2.
- Build + unit tests green at every task boundary.
- The two-account cross-user chat test (R7) is the headline proof, mirroring the Radar two-account test.

## Out of scope
- Real Luma API ingestion (sessions stay mock behind `useEventData`; only the link-out is added — matching `main`).
- Migrating `main`'s KV demo data.
- Ably (replaced by Supabase Realtime).
- Group chat / typing indicators / read receipts beyond unread counts.

## Open item for review
Confirm the **mock-attendee directory decision** (keep-as-seed-with-DMs-real-only vs real-users-only). Everything else is locked.
