"use client"

import React from "react"
import Link from "next/link"
import { SimClock } from "@/components/shell/SimClock"
import { ModeToggle } from "@/components/shell/ModeToggle"
import { Avatar } from "@/components/shell/Avatar"
import { useProfile } from "@/lib/hooks/useProfile"
import { colors, fonts, fontSize, fontWeight, spacing } from "@/lib/design/tokens"

export function TopBar() {
  const { profile, loading } = useProfile()
  const name = loading || !profile ? "Profile" : profile.name || "Profile"
  const avatar_url = profile?.avatar_url

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 52,
        zIndex: 50,
        background: colors.surface,
        borderBottom: `1px solid ${colors.line}`,
        display: "flex",
        alignItems: "center",
        padding: `0 ${spacing[4]}px`,
        gap: spacing[4],
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: fontWeight.bold,
            fontSize: fontSize.heading,
            color: colors.ink,
            lineHeight: 1.1,
          }}
        >
          Vector
        </span>
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: fontSize.micro,
            color: colors.mutedSoft,
            letterSpacing: "0.06em",
          }}
        >
          AABW · Ho Chi Minh City
        </span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* SimClock */}
      <SimClock />

      {/* ModeToggle */}
      <ModeToggle />

      {/* Profile button */}
      <Link
        href="/profile"
        style={{
          display: "flex",
          alignItems: "center",
          gap: spacing[2],
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        <Avatar name={name} photo={avatar_url} size={32} />
        <span
          style={{
            fontFamily: fonts.body,
            fontSize: fontSize.meta,
            fontWeight: fontWeight.medium,
            color: colors.ink,
          }}
        >
          {name}
        </span>
      </Link>
    </header>
  )
}

export default TopBar
