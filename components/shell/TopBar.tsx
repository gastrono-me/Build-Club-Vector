"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Bell, CalendarDays } from "lucide-react"
import { SimClock } from "@/components/shell/SimClock"
import { ModeToggle } from "@/components/shell/ModeToggle"
import { MobileMenu } from "@/components/shell/MobileMenu"
import { Avatar } from "@/components/shell/Avatar"
import { useProfile } from "@/lib/hooks/useProfile"
import { useSocial } from "@/components/shell/SocialProvider"
import { fmt } from "@/lib/time"
import {
  colors,
  fonts,
  fontSize,
  fontWeight,
  spacing,
  radii,
  shadows,
  motion,
} from "@/lib/design/tokens"

/** Tiny relative-time helper: <60s "now", <60m "Nm", <24h "Nh", else "Nd" */
function relTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diffMs / 1000)
  if (s < 60) return "now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}

export function TopBar() {
  const { profile, loading } = useProfile()
  const name = loading || !profile ? "Profile" : profile.name || "Profile"
  const avatar_url = profile?.avatar_url

  const { inbox, totalUnread, pendingCatchups, openPanel } = useSocial()
  const [open, setOpen] = useState(false)

  const notificationCount = totalUnread + pendingCatchups.length
  const badgeCount = notificationCount > 9 ? "9+" : String(notificationCount)

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

      {/* Mobile: hamburger trigger for the slide-out drawer (nav + controls + messages) */}
      <MobileMenu />

      <style>{`
        .vec-topbar-desktop { display: none; }
        @media (min-width: 768px) {
          .vec-topbar-desktop {
            display: flex;
            align-items: center;
            gap: ${spacing[4]}px;
          }
        }
      `}</style>
      <div className="vec-topbar-desktop">
      {/* SimClock */}
      <SimClock />

      {/* ModeToggle */}
      <ModeToggle />

      {/* Notifications bell */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {/* Click-away backdrop */}
        {open && (
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 98,
            }}
          />
        )}

        {/* Bell button */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Notifications"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: radii.md,
            border: `1.5px solid ${colors.line}`,
            background: "transparent",
            cursor: "pointer",
            color: colors.ink,
            padding: 0,
            transition: `background ${motion.fast} ${motion.ease}`,
            zIndex: 99,
          }}
        >
          <Bell size={16} strokeWidth={1.8} />
          {notificationCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                minWidth: 16,
                height: 16,
                borderRadius: radii.pill,
                background: colors.violet,
                color: colors.onDark,
                fontFamily: fonts.mono,
                fontSize: fontSize.micro,
                fontWeight: fontWeight.semibold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 3px",
                lineHeight: 1,
              }}
            >
              {badgeCount}
            </span>
          )}
        </button>

        {/* Dropdown panel */}
        {open && (
          <div
            style={{
              position: "absolute",
              top: 38,
              right: 0,
              width: 320,
              maxHeight: 360,
              overflowY: "auto",
              background: colors.surface,
              border: `1.5px solid ${colors.ink}`,
              borderRadius: radii.xl,
              boxShadow: shadows.card,
              zIndex: 99,
            }}
          >
            {pendingCatchups.map((c) => (
              <button
                key={`catchup-${c.id}`}
                onClick={() => {
                  openPanel({ id: c.otherId, name: c.otherName ?? "Builder", avatar: c.otherAvatar }, "catchup")
                  setOpen(false)
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing[2],
                  width: "100%",
                  padding: `${spacing[3]}px ${spacing[3]}px`,
                  background: colors.violetSoft,
                  border: "none",
                  borderBottom: `1px solid ${colors.line}`,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ flexShrink: 0, color: colors.violet }}>
                  <CalendarDays size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontFamily: fonts.body,
                      fontSize: fontSize.meta,
                      fontWeight: fontWeight.medium,
                      color: colors.ink,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.otherName ?? "Builder"} wants to catch up
                  </span>
                  <span style={{ fontFamily: fonts.mono, fontSize: fontSize.micro, color: colors.violet }}>
                    {fmt(c.start_min)}–{fmt(c.end_min)}
                  </span>
                </div>
              </button>
            ))}

            {inbox.length === 0 && pendingCatchups.length === 0 ? (
              <div
                style={{
                  padding: `${spacing[4]}px`,
                  fontFamily: fonts.body,
                  fontSize: fontSize.meta,
                  color: colors.muted,
                  textAlign: "center",
                }}
              >
                No notifications yet.
              </div>
            ) : (
              inbox.map((c) => (
                <button
                  key={c.otherId}
                  onClick={() => {
                    openPanel({ id: c.otherId, name: c.name ?? "Builder", avatar: c.avatar }, "chat")
                    setOpen(false)
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing[2],
                    width: "100%",
                    padding: `${spacing[3]}px ${spacing[3]}px`,
                    background: "transparent",
                    border: "none",
                    borderBottom: `1px solid ${colors.line}`,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {/* Avatar */}
                  <div style={{ flexShrink: 0 }}>
                    <Avatar name={c.name ?? "Builder"} photo={c.avatar} size={28} />
                  </div>

                  {/* Text content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: spacing[1],
                      }}
                    >
                      <span
                        style={{
                          fontFamily: fonts.body,
                          fontSize: fontSize.meta,
                          fontWeight: fontWeight.medium,
                          color: colors.ink,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.name ?? "Builder"}
                      </span>
                      <span
                        style={{
                          fontFamily: fonts.mono,
                          fontSize: fontSize.micro,
                          color: colors.mutedSoft,
                          flexShrink: 0,
                        }}
                      >
                        {relTime(c.lastAt)}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: fonts.body,
                        fontSize: fontSize.micro,
                        color: colors.muted,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                      }}
                    >
                      {c.lastBody}
                    </span>
                  </div>

                  {/* Unread dot */}
                  {c.unread > 0 && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: radii.pill,
                        background: colors.violet,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

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
      </div>
    </header>
  )
}

export default TopBar
