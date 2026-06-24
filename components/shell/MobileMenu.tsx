"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, CalendarDays } from "lucide-react"
import { colors, fonts, fontSize, fontWeight, spacing, radii, shadows, motion } from "@/lib/design/tokens"
import { deriveMode } from "@/lib/mode"
import { PULSE_ITEMS, LINE_ITEMS } from "@/lib/nav"
import { ModeToggle } from "@/components/shell/ModeToggle"
import { SimClock } from "@/components/shell/SimClock"
import { Avatar } from "@/components/shell/Avatar"
import { useProfile } from "@/lib/hooks/useProfile"
import { useSocial } from "@/components/shell/SocialProvider"
import { fmt } from "@/lib/time"

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

/** Mobile-only hamburger trigger + slide-out drawer holding nav, mode/clock controls, and messages. */
export function MobileMenu() {
  const pathname = usePathname()
  const mode = deriveMode(pathname)
  const items = mode === "pulse" ? PULSE_ITEMS : LINE_ITEMS
  const [open, setOpen] = useState(false)

  const { profile, loading } = useProfile()
  const name = loading || !profile ? "Profile" : profile.name || "Profile"
  const avatar_url = profile?.avatar_url

  const { inbox, totalUnread, pendingCatchups, openPanel } = useSocial()
  const notificationCount = totalUnread + pendingCatchups.length
  const badgeCount = notificationCount > 9 ? "9+" : String(notificationCount)

  return (
    <>
      <style>{`
        .vec-mobile-menu-root { display: contents; }
        .vec-hamburger { display: none; }
        @media (max-width: 767px) {
          .vec-hamburger { display: flex; }
        }
        @media (min-width: 768px) {
          .vec-mobile-menu-root { display: none; }
        }
      `}</style>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="vec-hamburger"
        style={{
          position: "relative",
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
          flexShrink: 0,
        }}
      >
        <Menu size={18} strokeWidth={1.8} />
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

      <div className="vec-mobile-menu-root">
        {open && (
          <div
            onClick={() => setOpen(false)}
            role="presentation"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(20,20,60,0.45)",
              backdropFilter: "blur(2px)",
              zIndex: 90,
            }}
          />
        )}

        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "min(82vw, 320px)",
            background: colors.surface,
            borderLeft: `1.5px solid ${colors.ink}`,
            boxShadow: shadows.modal,
            zIndex: 91,
            display: "flex",
            flexDirection: "column",
            transform: open ? "translateX(0)" : "translateX(100%)",
            transition: `transform ${motion.base} ${motion.ease}`,
            overflowY: "auto",
            visibility: open ? "visible" : "hidden",
          }}
        >
          {/* Header: profile + close */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: spacing[3],
              padding: spacing[4],
              borderBottom: `1.5px solid ${colors.ink}`,
              background: colors.panel,
              flexShrink: 0,
            }}
          >
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: spacing[2], textDecoration: "none", flex: 1, minWidth: 0 }}
            >
              <Avatar name={name} photo={avatar_url} size={32} />
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
                {name}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              style={{
                color: colors.muted,
                display: "flex",
                padding: 2,
                borderRadius: radii.sm,
                background: "none",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav items for the current mode */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: spacing[3] }}>
            {items.map(({ label, href, Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing[3],
                    padding: `${spacing[3]}px ${spacing[2]}px`,
                    borderRadius: radii.md,
                    textDecoration: "none",
                    background: active ? colors.violetSoft : "transparent",
                    color: active ? colors.violet : colors.ink,
                  }}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
                  <span
                    style={{
                      fontFamily: fonts.body,
                      fontSize: fontSize.body,
                      fontWeight: active ? fontWeight.semibold : fontWeight.regular,
                    }}
                  >
                    {label}
                  </span>
                </Link>
              )
            })}
          </div>

          <div style={{ height: 1, background: colors.line, margin: `0 ${spacing[3]}px` }} />

          {/* Mode + sim clock controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: spacing[3], padding: spacing[3] }}>
            <ModeToggle />
            <SimClock />
          </div>

          <div style={{ height: 1, background: colors.line, margin: `0 ${spacing[3]}px` }} />

          {/* Catchup requests */}
          {pendingCatchups.length > 0 && (
            <div style={{ padding: spacing[3] }}>
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: fontSize.label,
                  color: colors.mutedSoft,
                  letterSpacing: "0.06em",
                  marginBottom: spacing[2],
                }}
              >
                CATCHUP REQUESTS
              </div>
              {pendingCatchups.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    openPanel({ id: c.otherId, name: c.otherName ?? "Builder", avatar: c.otherAvatar }, "catchup")
                    setOpen(false)
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing[2],
                    width: "100%",
                    padding: `${spacing[2]}px ${spacing[2]}px`,
                    background: colors.violetSoft,
                    border: "none",
                    borderRadius: radii.md,
                    marginBottom: spacing[1],
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
            </div>
          )}

          <div style={{ height: 1, background: colors.line, margin: `0 ${spacing[3]}px` }} />

          {/* Messages */}
          <div style={{ padding: spacing[3], flex: 1 }}>
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: fontSize.label,
                color: colors.mutedSoft,
                letterSpacing: "0.06em",
                marginBottom: spacing[2],
              }}
            >
              MESSAGES
            </div>
            {inbox.length === 0 ? (
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: fontSize.meta,
                  color: colors.muted,
                  padding: `${spacing[2]}px 0`,
                }}
              >
                No messages yet.
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
                    padding: `${spacing[2]}px 0`,
                    background: "transparent",
                    border: "none",
                    borderBottom: `1px solid ${colors.line}`,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <Avatar name={c.name ?? "Builder"} photo={c.avatar} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing[1] }}>
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
                      <span style={{ fontFamily: fonts.mono, fontSize: fontSize.micro, color: colors.mutedSoft, flexShrink: 0 }}>
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
                  {c.unread > 0 && (
                    <div style={{ width: 8, height: 8, borderRadius: radii.pill, background: colors.violet, flexShrink: 0 }} />
                  )}
                </button>
              ))
            )}
          </div>
        </aside>
      </div>
    </>
  )
}

export default MobileMenu
