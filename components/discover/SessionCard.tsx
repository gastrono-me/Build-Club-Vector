"use client"

import React, { useState } from "react"
import { Plus, Check } from "lucide-react"
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
  radii,
  spacing,
} from "@/lib/design/tokens"

export interface SessionCardProps {
  session: Session | TbaSession
  isLive: boolean
  isSaved: boolean
  onToggleSave?: () => void
  venueName: string
}

/** Small circular icon button (or link) with a text bubble that appears on hover. */
function IconButtonWithTooltip({
  tooltip,
  onClick,
  href,
  active,
  children,
  ariaLabel,
}: {
  tooltip: string
  onClick?: () => void
  href?: string
  active?: boolean
  children: React.ReactNode
  ariaLabel: string
}) {
  const [hover, setHover] = useState(false)
  const triggerStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    background: active ? colors.violet : "transparent",
    border: `1.5px solid ${active ? colors.violet : colors.line}`,
    borderRadius: radii.pill,
    color: active ? colors.onDark : colors.muted,
    cursor: "pointer",
    flexShrink: 0,
    textDecoration: "none",
  }
  return (
    <div
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: colors.ink,
            color: colors.onDark,
            fontFamily: fonts.mono,
            fontSize: fontSize.label,
            letterSpacing: letterSpacing.label,
            textTransform: "uppercase" as const,
            whiteSpace: "nowrap",
            padding: "4px 8px",
            borderRadius: radii.sm,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {tooltip}
        </div>
      )}
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} style={triggerStyle}>
          {children}
        </a>
      ) : (
        <button type="button" onClick={onClick} aria-label={ariaLabel} aria-pressed={active} style={triggerStyle}>
          {children}
        </button>
      )}
    </div>
  )
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
          <IconButtonWithTooltip
            tooltip={isSaved ? "Remove from schedule" : "Add to schedule"}
            ariaLabel={isSaved ? "Remove from schedule" : "Add to schedule"}
            active={isSaved}
            onClick={onToggleSave}
          >
            {isSaved ? <Check size={13} strokeWidth={2.5} /> : <Plus size={13} strokeWidth={2.5} />}
          </IconButtonWithTooltip>
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
          <div style={{ marginLeft: "auto" }}>
            <IconButtonWithTooltip tooltip="Sign up on Luma" ariaLabel="Sign up on Luma" href={session.lumaUrl}>
              <img src="/luma-logo.png" alt="" width={13} height={13} />
            </IconButtonWithTooltip>
          </div>
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
