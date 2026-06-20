# Now / Maps / Ask Clawbie — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three thin views — Now (SimClock-driven home feed), Maps (SVG city + floor-plan ported from legacy reference), and Ask Clawbie (placeholder page for the event assistant).

**Architecture:** Each view is a Next.js App Router page (`app/<slug>/page.tsx`) that delegates rendering to a component in `components/<slug>/`. The Now page is a client component that reads `useSimClock` + `useEventData` directly — no intermediate hook needed. Maps ports two SVG components verbatim from the legacy reference (typed, token-coloured) and adds a day selector that defaults to the sim clock's current day. Clawbie is a pure RSC with no interactivity.

**Tech Stack:** Next.js 14 App Router, TypeScript, inline styles only (no Tailwind / CSS modules), `lib/design/tokens.ts` for all colour + type values, existing primitives `Card`, `Button`, `SectionTitle`, `Tag`.

## Global Constraints

- No em-dashes anywhere in copy.
- No hype in copy — reserved, factual, peer-to-peer voice.
- No chatbot, no model call, no AI logic in Clawbie.
- Design tokens (`lib/design/tokens.ts`) for every colour, font, radius, spacing value.
- Use `"use client"` directive on any component that calls React hooks.
- `npm run build` must pass with zero TypeScript errors.
- Plain conventional commit messages — no spec IDs, task references, or planning-doc mentions.
- Commit each task separately.

---

## File Map

| Path | Action | Responsibility |
|---|---|---|
| `app/page.tsx` | Modify | Thin client wrapper that renders NowView |
| `components/now/NowView.tsx` | Create | SimClock-driven feed: now/next session cards |
| `app/maps/page.tsx` | Create | Maps route — renders MapsView |
| `components/maps/MapsView.tsx` | Create | Day selector + conditional SVG display |
| `components/maps/CityMapSVG.tsx` | Create | Illustrative city map with venue pins |
| `components/maps/BuildFloorPlanSVG.tsx` | Create | Illustrative build-day floor plan |
| `app/clawbie/page.tsx` | Create | Clawbie route — renders ClawbiePlaceholder |
| `components/clawbie/ClawbiePlaceholder.tsx` | Create | Non-interactive "coming soon" content |

---

### Task 1: Now feed

**Files:**
- Modify: `app/page.tsx`
- Create: `components/now/NowView.tsx`

**Interfaces:**
- Consumes: `useSimClock()` → `{ day: number, mins: number }` from `@/lib/hooks/useSimClock`
- Consumes: `useEventData()` → `{ sessions: Session[], days: Day[] }` from `@/lib/data/useEventData`
- Consumes: `fmt(mins: number): string` from `@/lib/time`
- Consumes: `Card` (spine prop), `SectionTitle`, `Tag` from `@/components/ui/`
- Produces: default export `NowView` (no props)

- [ ] **Step 1: Create `components/now/NowView.tsx`**

```tsx
"use client"

import React from "react"
import { useSimClock } from "@/lib/hooks/useSimClock"
import { useEventData } from "@/lib/data/useEventData"
import { fmt } from "@/lib/time"
import { Card } from "@/components/ui/Card"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { Tag } from "@/components/ui/Tag"
import { colors, fonts, fontSize, fontWeight, spacing } from "@/lib/design/tokens"
import type { Session } from "@/types/index"

const UP_NEXT_COUNT = 3

function SessionRow({ s, live }: { s: Session; live: boolean }) {
  return (
    <Card spine={live ? "live" : "violet"} style={{ marginBottom: spacing[2] }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: spacing[2] }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: fontWeight.semibold,
              fontSize: fontSize.heading,
              color: colors.ink,
              marginBottom: 2,
            }}
          >
            {s.title}
          </div>
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: fontSize.meta,
              color: colors.muted,
              marginBottom: spacing[1],
            }}
          >
            {s.by}
          </div>
          <div style={{ display: "flex", gap: spacing[1], flexWrap: "wrap" }}>
            {s.tags.slice(0, 3).map((t) => (
              <Tag key={t} tone={live ? "live" : "violet"}>
                {t}
              </Tag>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: fontSize.label,
              color: live ? colors.live : colors.violet,
              fontWeight: fontWeight.medium,
            }}
          >
            {fmt(s.start)}
          </div>
          {live && (
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: fontSize.micro,
                color: colors.live,
                marginTop: 2,
              }}
            >
              NOW
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export function NowView() {
  const { day, mins } = useSimClock()
  const { sessions, days } = useEventData()

  const todaySessions = sessions.filter((s) => s.day === day)
  const liveSessions = todaySessions.filter((s) => s.start <= mins && mins < s.end)
  const upNext = todaySessions
    .filter((s) => s.start > mins)
    .sort((a, b) => a.start - b.start)
    .slice(0, UP_NEXT_COUNT)

  const currentDay = days.find((d) => d.idx === day)

  return (
    <div style={{ padding: `${spacing[5]}px ${spacing[4]}px`, maxWidth: 680, margin: "0 auto" }}>
      <SectionTitle
        kicker="Now"
        title={currentDay ? currentDay.label : `Day ${day + 1}`}
        note={currentDay ? `${currentDay.date} · ${currentDay.sub}` : undefined}
      />

      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: fontSize.meta,
          color: colors.muted,
          marginBottom: spacing[5],
        }}
      >
        {fmt(mins)}
      </div>

      {liveSessions.length > 0 && (
        <section style={{ marginBottom: spacing[6] }}>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: fontSize.label,
              color: colors.live,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: spacing[2],
            }}
          >
            Happening now
          </div>
          {liveSessions.map((s) => (
            <SessionRow key={s.id} s={s} live />
          ))}
        </section>
      )}

      {upNext.length > 0 && (
        <section>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: fontSize.label,
              color: colors.muted,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: spacing[2],
            }}
          >
            Up next
          </div>
          {upNext.map((s) => (
            <SessionRow key={s.id} s={s} live={false} />
          ))}
        </section>
      )}

      {liveSessions.length === 0 && upNext.length === 0 && (
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: fontSize.body,
            color: colors.muted,
            padding: `${spacing[8]}px 0`,
            textAlign: "center",
          }}
        >
          No more sessions today.
        </div>
      )}
    </div>
  )
}

export default NowView
```

- [ ] **Step 2: Replace `app/page.tsx`**

```tsx
"use client"

import { NowView } from "@/components/now/NowView"

export default function Home() {
  return <NowView />
}
```

- [ ] **Step 3: Run the build to check types**

```bash
cd /Users/jrmyyee/Documents/Projects/Build-Club-Vector && npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors for these two files.

- [ ] **Step 4: Commit**

```bash
cd /Users/jrmyyee/Documents/Projects/Build-Club-Vector
git add app/page.tsx components/now/NowView.tsx
git commit -m "feat: add Now home feed driven by SimClock"
```

---

### Task 2: Maps SVG components

**Files:**
- Create: `components/maps/CityMapSVG.tsx`
- Create: `components/maps/BuildFloorPlanSVG.tsx`

**Interfaces:**
- `CityMapSVG` accepts `{ activeKeys: Set<string> }` — renders an illustrative city map with venue pins highlighted/dimmed per the set.
- `BuildFloorPlanSVG` accepts no props — renders the illustrative build-day floor plan.
- Both use a locally-defined `VENUE_MAP_POS` constant (pin coordinates) and import `VENUES` from `@/lib/data/venues`.

- [ ] **Step 5: Create `components/maps/CityMapSVG.tsx`**

Port directly from `.superpowers/sdd/keep/legacy-App.jsx` lines 844-878. Replace the legacy `C.*` and `FONT_*` references with design token imports. Keep all SVG geometry identical.

```tsx
import React from "react"
import { colors, fonts } from "@/lib/design/tokens"
import { VENUES } from "@/lib/data/venues"

/** Fixed pin positions for the illustrative city map. Not to scale. */
const VENUE_MAP_POS: Record<string, { x: number; y: number }> = {
  sihub: { x: 130, y: 90 },
  gem:   { x: 260, y: 255 },
  dream: { x: 190, y: 210 },
  hive:  { x: 530, y: 190 },
  rmit:  { x: 260, y: 400 },
}

export function CityMapSVG({ activeKeys }: { activeKeys: Set<string> }) {
  return (
    <svg viewBox="0 0 640 460" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect width="640" height="460" rx="20" fill={colors.surface} />
      <path
        d="M 430 -10 C 400 80 460 160 420 240 C 390 320 450 380 415 470"
        stroke="#BFE0EE"
        strokeWidth="46"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />

      <rect x="40"  y="30"  width="200" height="130" rx="22" fill="#fff" stroke={colors.line} />
      <text x="58"  y="54"  fontFamily={fonts.mono} fontSize="11" fill={colors.muted} letterSpacing="0.06em">DISTRICT 3</text>

      <rect x="120" y="170" width="260" height="170" rx="22" fill="#fff" stroke={colors.line} />
      <text x="138" y="194" fontFamily={fonts.mono} fontSize="11" fill={colors.muted} letterSpacing="0.06em">DISTRICT 1</text>

      <rect x="460" y="110" width="150" height="170" rx="22" fill="#fff" stroke={colors.line} />
      <text x="475" y="134" fontFamily={fonts.mono} fontSize="11" fill={colors.muted} letterSpacing="0.06em">DISTRICT 2</text>

      <rect x="150" y="365" width="220" height="75"  rx="22" fill="#fff" stroke={colors.line} />
      <text x="168" y="389" fontFamily={fonts.mono} fontSize="11" fill={colors.muted} letterSpacing="0.06em">DISTRICT 7</text>

      {Object.entries(VENUES).map(([key, v]) => {
        const pos = VENUE_MAP_POS[key]
        if (!pos) return null
        const active = activeKeys.has(key)
        return (
          <g key={key} opacity={active ? 1 : 0.35}>
            {active && <circle cx={pos.x} cy={pos.y} r="15" fill={colors.violet} opacity="0.16" />}
            <circle
              cx={pos.x}
              cy={pos.y}
              r="9"
              fill={active ? colors.violet : colors.mutedSoft}
              stroke="#fff"
              strokeWidth="2.5"
            />
            <text
              x={pos.x}
              y={pos.y + 24}
              textAnchor="middle"
              fontFamily={fonts.display}
              fontWeight="600"
              fontSize="12.5"
              fill={active ? colors.ink : colors.mutedSoft}
            >
              {v.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default CityMapSVG
```

- [ ] **Step 6: Create `components/maps/BuildFloorPlanSVG.tsx`**

Port from `.superpowers/sdd/keep/legacy-App.jsx` lines 880-918.

```tsx
import React from "react"
import { colors, fonts } from "@/lib/design/tokens"

export function BuildFloorPlanSVG() {
  const tableGrid = (x0: number, y0: number, cols: number, rows: number) => {
    const items: { x: number; y: number }[] = []
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        items.push({ x: x0 + c * 60, y: y0 + r * 44 })
    return items
  }
  const zoneA = tableGrid(40, 170, 4, 3)
  const zoneB = tableGrid(350, 170, 4, 3)

  return (
    <svg viewBox="0 0 640 440" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect x="20" y="20" width="600" height="400" rx="18" fill="#fff" stroke={colors.line} strokeWidth="2" />

      <rect x="20"  y="20"  width="110" height="60" rx="10" fill={colors.violetSoft} />
      <text x="35"  y="55"  fontFamily={fonts.display} fontWeight="600" fontSize="12" fill={colors.violet}>Registration</text>

      <rect x="150" y="20"  width="470" height="90" rx="10" fill={colors.liveSoft} />
      <text x="170" y="55"  fontFamily={fonts.display} fontWeight="700" fontSize="15" fill={colors.live}>Main Stage</text>
      <text x="170" y="75"  fontFamily={fonts.mono}    fontSize="11"   fill={colors.live} opacity="0.8">Keynotes · Talks · Demo Day</text>

      <rect x="20"  y="130" width="290" height="200" rx="10" fill={colors.surface} stroke={colors.line} />
      <text x="36"  y="155" fontFamily={fonts.display} fontWeight="600" fontSize="13" fill={colors.ink}>Build Zone A</text>
      {zoneA.map((t, i) => (
        <rect key={"a" + i} x={t.x} y={t.y} width="46" height="30" rx="5" fill="#fff" stroke={colors.line} />
      ))}

      <rect x="330" y="130" width="290" height="200" rx="10" fill={colors.surface} stroke={colors.line} />
      <text x="346" y="155" fontFamily={fonts.display} fontWeight="600" fontSize="13" fill={colors.ink}>Build Zone B</text>
      {zoneB.map((t, i) => (
        <rect key={"b" + i} x={t.x} y={t.y} width="46" height="30" rx="5" fill="#fff" stroke={colors.line} />
      ))}

      <rect x="20"  y="340" width="180" height="80" rx="10" fill={colors.goSoft} />
      <text x="36"  y="375" fontFamily={fonts.display} fontWeight="600" fontSize="13" fill={colors.go}>Mentor Lounge</text>

      <rect x="220" y="340" width="180" height="80" rx="10" fill="#FBE8C9" />
      <text x="236" y="375" fontFamily={fonts.display} fontWeight="600" fontSize="13" fill="#9A5B00">Snacks &amp; Coffee</text>

      <rect x="420" y="340" width="200" height="80" rx="10" fill={colors.violetSoft} />
      <text x="436" y="375" fontFamily={fonts.display} fontWeight="600" fontSize="13" fill={colors.violet}>Quiet / Focus Room</text>
    </svg>
  )
}

export default BuildFloorPlanSVG
```

- [ ] **Step 7: Commit SVG components**

```bash
cd /Users/jrmyyee/Documents/Projects/Build-Club-Vector
git add components/maps/CityMapSVG.tsx components/maps/BuildFloorPlanSVG.tsx
git commit -m "feat: port city map and build floor plan SVG components"
```

---

### Task 3: Maps view and page

**Files:**
- Create: `components/maps/MapsView.tsx`
- Create: `app/maps/page.tsx`

**Interfaces:**
- Consumes: `CityMapSVG({ activeKeys: Set<string> })` from `./CityMapSVG`
- Consumes: `BuildFloorPlanSVG()` from `./BuildFloorPlanSVG`
- Consumes: `useSimClock()` → `{ day: number }` from `@/lib/hooks/useSimClock`
- Consumes: `useEventData()` → `{ sessions, days, venues }` from `@/lib/data/useEventData`
- Consumes: `SectionTitle`, `Tag`, `Card` from `@/components/ui/`
- `MapsView` has no props. Default-exports itself.

- [ ] **Step 8: Create `components/maps/MapsView.tsx`**

Days 0-2 are workshop days (city map). Days 3-4 are build/demo days (floor plan). Day selector defaults to the sim clock's current day. The "Build & Demo" tab covers day indices 3 and 4.

```tsx
"use client"

import React, { useState } from "react"
import { useSimClock } from "@/lib/hooks/useSimClock"
import { useEventData } from "@/lib/data/useEventData"
import { fmt } from "@/lib/time"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { Tag } from "@/components/ui/Tag"
import { CityMapSVG } from "./CityMapSVG"
import { BuildFloorPlanSVG } from "./BuildFloorPlanSVG"
import { colors, fonts, fontSize, fontWeight, spacing, radii } from "@/lib/design/tokens"

type TabId = 0 | 1 | 2 | "build"

const DAY_OPTIONS: { id: TabId; label: string }[] = [
  { id: 0,       label: "Day 1 · Jul 8" },
  { id: 1,       label: "Day 2 · Jul 9" },
  { id: 2,       label: "Day 3 · Jul 10" },
  { id: "build", label: "Build & Demo · Jul 11-12" },
]

const BUILD_ZONES = [
  { name: "Main Stage",          desc: "Keynotes, talks, and Demo Day presentations" },
  { name: "Build Zone A & B",    desc: "Team tables — heads-down building" },
  { name: "Mentor Lounge",       desc: "Drop in for help, roaming mentors" },
  { name: "Snacks & Coffee",     desc: "Fuel for the long sessions" },
  { name: "Quiet / Focus Room",  desc: "Need silence? Head here" },
  { name: "Registration",        desc: "Check-in, badges, lost and found" },
]

function simDayToTab(day: number): TabId {
  if (day >= 3) return "build"
  return day as 0 | 1 | 2
}

export function MapsView() {
  const { day: simDay } = useSimClock()
  const { sessions, venues } = useEventData()
  const [selected, setSelected] = useState<TabId>(simDayToTab(simDay))

  const isBuild = selected === "build"
  const dayIndex = isBuild ? null : (selected as number)
  const daySessions = dayIndex !== null ? sessions.filter((s) => s.day === dayIndex) : []
  const activeKeys = new Set(daySessions.map((s) => s.venue))
  const venuesToday = [...activeKeys].map((k) => ({
    key: k,
    ...venues[k],
    sessions: daySessions.filter((s) => s.venue === k).sort((a, b) => a.start - b.start),
  }))

  return (
    <div style={{ padding: `${spacing[5]}px ${spacing[4]}px`, maxWidth: 720, margin: "0 auto" }}>
      <SectionTitle
        kicker="Find your way"
        title="Maps & venues"
        note="Illustrative layouts. Exact floor plans are confirmed closer to the event; venues and zones are real."
      />

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: spacing[4] }}>
        {DAY_OPTIONS.map((d) => (
          <Tag key={String(d.id)} active={selected === d.id} onClick={() => setSelected(d.id)}>
            {d.label}
          </Tag>
        ))}
      </div>

      <div
        style={{
          background: colors.panel,
          border: `1px solid ${colors.line}`,
          borderRadius: radii.xl,
          padding: spacing[4],
          marginBottom: spacing[5],
        }}
      >
        {isBuild ? <BuildFloorPlanSVG /> : <CityMapSVG activeKeys={activeKeys} />}
      </div>

      {isBuild ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: spacing[2],
          }}
        >
          {BUILD_ZONES.map((z) => (
            <div
              key={z.name}
              style={{
                background: colors.panel,
                border: `1px solid ${colors.line}`,
                borderRadius: radii.lg,
                padding: spacing[3],
              }}
            >
              <div
                style={{
                  fontFamily: fonts.display,
                  fontWeight: fontWeight.semibold,
                  fontSize: fontSize.body,
                  color: colors.ink,
                }}
              >
                {z.name}
              </div>
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: fontSize.meta,
                  color: colors.muted,
                  marginTop: 3,
                }}
              >
                {z.desc}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gap: spacing[3] }}>
          {venuesToday.map((v) => (
            <div
              key={v.key}
              style={{
                background: colors.panel,
                border: `1px solid ${colors.line}`,
                borderRadius: radii.xl,
                padding: spacing[4],
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: spacing[2],
                  flexWrap: "wrap",
                  gap: spacing[1],
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.display,
                    fontWeight: fontWeight.semibold,
                    fontSize: 15,
                    color: colors.ink,
                  }}
                >
                  {v.name}
                </span>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: fontSize.label,
                    color: colors.muted,
                  }}
                >
                  {v.area}{v.main ? " · main venue" : ""}
                </span>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {v.sessions.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      gap: spacing[2],
                      alignItems: "baseline",
                      fontSize: fontSize.body,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: fonts.mono,
                        fontSize: fontSize.label,
                        color: colors.violet,
                        flexShrink: 0,
                        width: 78,
                      }}
                    >
                      {fmt(s.start)}
                    </span>
                    <span style={{ color: colors.ink }}>{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MapsView
```

- [ ] **Step 9: Create `app/maps/page.tsx`**

```tsx
import { MapsView } from "@/components/maps/MapsView"

export default function MapsPage() {
  return <MapsView />
}
```

Note: `MapsView` is `"use client"` internally. The page itself can be a server component that just renders it.

- [ ] **Step 10: Run the build to check types**

```bash
cd /Users/jrmyyee/Documents/Projects/Build-Club-Vector && npm run build 2>&1 | tail -20
```

Expected: no errors for map files.

- [ ] **Step 11: Commit**

```bash
cd /Users/jrmyyee/Documents/Projects/Build-Club-Vector
git add components/maps/MapsView.tsx app/maps/page.tsx
git commit -m "feat: add Maps view with day selector and venue schedule"
```

---

### Task 4: Ask Clawbie placeholder

**Files:**
- Create: `components/clawbie/ClawbiePlaceholder.tsx`
- Create: `app/clawbie/page.tsx`

**Interfaces:**
- `ClawbiePlaceholder` has no props. It is a pure server component (no hooks, no `"use client"`).
- Produces a non-interactive informational layout.

- [ ] **Step 12: Create `components/clawbie/ClawbiePlaceholder.tsx`**

Copy: reserved, factual. No em-dashes. No hype. No chatbot UI. No model calls.

```tsx
import React from "react"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { colors, fonts, fontSize, fontWeight, spacing, radii } from "@/lib/design/tokens"

export function ClawbiePlaceholder() {
  return (
    <div style={{ padding: `${spacing[5]}px ${spacing[4]}px`, maxWidth: 600, margin: "0 auto" }}>
      <SectionTitle
        kicker="Coming soon"
        title="Ask Clawbie"
        note="Not yet live."
      />

      <div
        style={{
          background: colors.panel,
          border: `1px solid ${colors.line}`,
          borderRadius: radii.xl,
          padding: spacing[6],
          marginBottom: spacing[4],
        }}
      >
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: fontSize.body,
            color: colors.ink,
            lineHeight: 1.6,
            margin: `0 0 ${spacing[4]}px`,
          }}
        >
          Clawbie is Build Club's event assistant. It answers questions about the schedule,
          venues, sessions, and speakers using data from your actual event programme.
        </p>
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: fontSize.body,
            color: colors.muted,
            lineHeight: 1.6,
            margin: `0 0 ${spacing[4]}px`,
          }}
        >
          The assistant is being integrated by the event organiser and will be available
          before the event opens. Until then, use the Schedule and Maps pages for session
          and venue information.
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: spacing[2],
            background: colors.surface,
            border: `1px solid ${colors.line}`,
            borderRadius: radii.md,
            padding: `${spacing[2]}px ${spacing[3]}px`,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: colors.mutedSoft,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: fontSize.label,
              color: colors.muted,
            }}
          >
            Offline
          </span>
        </div>
      </div>

      <div
        style={{
          background: colors.violetSoft,
          borderRadius: radii.lg,
          padding: spacing[4],
        }}
      >
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: fontWeight.semibold,
            fontSize: fontSize.body,
            color: colors.violet,
            marginBottom: spacing[1],
          }}
        >
          What it will do
        </div>
        <ul
          style={{
            fontFamily: fonts.body,
            fontSize: fontSize.body,
            color: colors.ink,
            lineHeight: 1.7,
            margin: 0,
            paddingLeft: spacing[4],
          }}
        >
          <li>Answer questions about sessions, timing, and locations</li>
          <li>Surface speakers and topics relevant to what you are working on</li>
          <li>Help you find the right workshop or person during the event</li>
        </ul>
      </div>
    </div>
  )
}

export default ClawbiePlaceholder
```

- [ ] **Step 13: Create `app/clawbie/page.tsx`**

```tsx
import { ClawbiePlaceholder } from "@/components/clawbie/ClawbiePlaceholder"

export default function ClawbiePage() {
  return <ClawbiePlaceholder />
}
```

- [ ] **Step 14: Full build check**

```bash
cd /Users/jrmyyee/Documents/Projects/Build-Club-Vector && npm run build 2>&1 | tail -30
```

Expected: exit 0, no type errors.

- [ ] **Step 15: Commit**

```bash
cd /Users/jrmyyee/Documents/Projects/Build-Club-Vector
git add components/clawbie/ClawbiePlaceholder.tsx app/clawbie/page.tsx
git commit -m "feat: add Ask Clawbie placeholder page"
```

---

## Self-Review Checklist

- [ ] Now: thin, reads SimClock, coral `live` spine on happening-now sessions, `violet` spine on up-next.
- [ ] Maps: SVG geometry unchanged from legacy; all `C.*`/`FONT_*` replaced with token imports; "Illustrative" note in `SectionTitle`; day selector defaults to sim-clock day.
- [ ] Clawbie: no chatbot UI, no model calls, no `"use client"`, copy is plain/factual, no em-dashes.
- [ ] Design tokens used throughout; no hardcoded colour hex values except the two legacy-exact values `#BFE0EE` (river) and `#FBE8C9` / `#9A5B00` (snacks zone) that have no token equivalent.
- [ ] `npm run build` passes.
