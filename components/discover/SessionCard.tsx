"use client"

import React from "react"
import { ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Tag } from "@/components/ui/Tag"
import { fmt } from "@/lib/time"
import type { Session, TbaSession } from "@/types/index"
import {
  colors,
  fonts,
  fontSize,
  fontWeight,
  letterSpacing,
  spacing,
} from "@/lib/design/tokens"

export interface SessionCardProps {
  session: Session | TbaSession
  isLive: boolean
  isSaved: boolean
  onToggleSave?: () => void
  venueName: string
}

export function SessionCard({
  session,
  isLive,
  isSaved,
  onToggleSave,
  venueName,
}: SessionCardProps) {
  return (
    <Card spine={isLive ? "live" : "violet"}>
      {/* Top row: title + save toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: spacing[2],
          marginBottom: spacing[1],
        }}
      >
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: fontWeight.semibold,
            fontSize: fontSize.heading,
            color: colors.ink,
            lineHeight: 1.25,
            flex: 1,
          }}
        >
          {session.title}
        </div>
        {onToggleSave && (
          <button
            type="button"
            onClick={onToggleSave}
            aria-label={isSaved ? "Remove from saved" : "Save session"}
            aria-pressed={isSaved}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px 4px",
              fontSize: fontSize.heading,
              lineHeight: 1,
              color: isSaved ? colors.violet : colors.mutedSoft,
              flexShrink: 0,
            }}
          >
            {isSaved ? "★" : "☆"}
          </button>
        )}
      </div>

      {/* Time range */}
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: fontSize.meta,
          color: colors.muted,
          marginBottom: spacing[2],
        }}
      >
        {"start" in session ? `${fmt(session.start)} – ${fmt(session.end)}` : "Time TBA"}
      </div>

      {/* Venue + type row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: spacing[2],
          marginBottom: session.desc ? spacing[2] : 0,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: fonts.body,
            fontSize: fontSize.meta,
            color: colors.muted,
          }}
        >
          {venueName}
        </span>
        <Tag tone={isLive ? "live" : "violet"}>{session.type}</Tag>
        {session.lumaUrl && (
          <a
            href={session.lumaUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: spacing[1],
              fontFamily: fonts.mono,
              fontSize: fontSize.label,
              letterSpacing: letterSpacing.label,
              color: colors.violet,
              textDecoration: "none",
              textTransform: "uppercase" as const,
              marginLeft: "auto",
            }}
          >
            Sign up on Luma
            <ExternalLink size={10} strokeWidth={2} />
          </a>
        )}
      </div>

      {/* Description */}
      {session.desc && (
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: fontSize.meta,
            color: colors.muted,
            lineHeight: 1.5,
            marginTop: spacing[1],
          }}
        >
          {session.desc}
        </div>
      )}
    </Card>
  )
}

export default SessionCard
