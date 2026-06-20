"use client"

import React from "react"
import Link from "next/link"
import { useEventData } from "@/lib/data/useEventData"
import { useSimClock } from "@/lib/hooks/useSimClock"
import { useSavedSchedule } from "@/lib/hooks/useSavedSchedule"
import { conflictIds } from "@/lib/schedule"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { Tag } from "@/components/ui/Tag"
import { SessionCard } from "@/components/discover/SessionCard"
import { colors, fonts, fontSize, fontWeight, letterSpacing, radii, spacing } from "@/lib/design/tokens"

export function ScheduleView() {
  const { sessions, days, venues } = useEventData()
  const { day: simDay, mins: simMins } = useSimClock()
  const { saved, toggle, loading } = useSavedSchedule()

  // Filter to saved sessions only
  const savedSessions = sessions.filter(s => saved.has(s.id))

  // Compute conflicts
  const conflicts = conflictIds(savedSessions)

  // Group by day, sorted by start within each day
  const byDay = new Map<number, typeof savedSessions>()
  for (const session of savedSessions) {
    if (!byDay.has(session.day)) byDay.set(session.day, [])
    byDay.get(session.day)!.push(session)
  }
  // Sort sessions within each day by start time
  for (const [, list] of byDay) {
    list.sort((a, b) => a.start - b.start)
  }
  // Get sorted day indices
  const sortedDayIndices = Array.from(byDay.keys()).sort((a, b) => a - b)

  return (
    <div>
      <SectionTitle kicker="MY SCHEDULE" title="Saved Sessions" />

      {/* Conflict warning */}
      {conflicts.size > 0 && (
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: fontSize.body,
            color: colors.live,
            marginBottom: spacing[4],
            padding: `${spacing[3]}px ${spacing[4]}px`,
            background: colors.liveSoft,
            borderRadius: radii.sm,
            border: `1px solid ${colors.live}`,
          }}
        >
          Some sessions overlap — check conflicts below.
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: fontSize.meta,
            color: colors.mutedSoft,
            marginBottom: spacing[4],
          }}
        >
          Loading saved sessions…
        </div>
      )}

      {/* Empty state */}
      {!loading && savedSessions.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: `${spacing[12]}px 0`,
          }}
        >
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: fontSize.body,
              color: colors.muted,
              marginBottom: spacing[3],
            }}
          >
            Nothing saved yet.
          </div>
          <Link
            href="/discover"
            style={{
              fontFamily: fonts.mono,
              fontSize: fontSize.meta,
              color: colors.violet,
              textDecoration: "none",
              fontWeight: fontWeight.medium,
              letterSpacing: letterSpacing.tag,
            }}
          >
            Browse the schedule →
          </Link>
        </div>
      )}

      {/* Day groups */}
      {sortedDayIndices.map(dayIdx => {
        const daySessions = byDay.get(dayIdx)!
        const dayMeta = days.find(d => d.idx === dayIdx)
        return (
          <div key={dayIdx} style={{ marginBottom: spacing[8] }}>
            {/* Day sub-header */}
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: fontSize.label,
                fontWeight: fontWeight.semibold,
                color: colors.muted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: spacing[3],
                paddingBottom: spacing[2],
                borderBottom: `1px solid ${colors.line}`,
              }}
            >
              {dayMeta ? dayMeta.label : `Day ${dayIdx + 1}`}
            </div>

            {/* Sessions in day */}
            <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
              {daySessions.map(session => {
                const isLive =
                  session.day === simDay &&
                  session.start <= simMins &&
                  session.end > simMins
                const venueName = venues[session.venue]?.name ?? session.venue
                const hasConflict = conflicts.has(session.id)
                return (
                  <div key={session.id}>
                    <SessionCard
                      session={session}
                      isLive={isLive}
                      isSaved={true}
                      onToggleSave={() => toggle(session.id)}
                      venueName={venueName}
                    />
                    {hasConflict && (
                      <div style={{ marginTop: spacing[1] }}>
                        <Tag tone="live">Clashes</Tag>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ScheduleView
