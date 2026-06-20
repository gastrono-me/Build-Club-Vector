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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: spacing[2],
        }}
      >
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
    <div
      style={{
        padding: `${spacing[5]}px ${spacing[4]}px`,
        maxWidth: 680,
        margin: "0 auto",
      }}
    >
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
