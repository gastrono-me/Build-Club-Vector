"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Zap,
  Compass,
  Users,
  Map,
  Calendar,
  MessageCircle,
  Clock,
  Activity,
  Mic,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react"
import { colors, fonts, fontSize, fontWeight, spacing, radii, motion } from "@/lib/design/tokens"
import { deriveMode } from "@/lib/mode"
import { Modal } from "@/components/ui/Modal"

interface NavItem {
  label: string
  href: string
  Icon: LucideIcon
}

const PULSE_ITEMS: NavItem[] = [
  { label: "Now", href: "/", Icon: Zap },
  { label: "Discover", href: "/discover", Icon: Compass },
  { label: "Schedule", href: "/schedule", Icon: Calendar },
  { label: "People", href: "/people", Icon: Users },
  { label: "Maps", href: "/maps", Icon: Map },
  { label: "Ask Clawbie", href: "/clawbie", Icon: MessageCircle },
]

const LINE_ITEMS: NavItem[] = [
  { label: "Deadline Guardian", href: "/deadline", Icon: Clock },
  { label: "Bottleneck Radar", href: "/radar", Icon: Activity },
  { label: "Pitch Coach", href: "/pitch", Icon: Mic },
]

/** Mobile bottom bar only has room for this many tabs before "More". */
const MOBILE_PRIMARY_COUNT = 3

export function Nav() {
  const pathname = usePathname()
  const mode = deriveMode(pathname)
  const items = mode === "pulse" ? PULSE_ITEMS : LINE_ITEMS

  const primaryItems = items.slice(0, MOBILE_PRIMARY_COUNT)
  const moreItems = items.slice(MOBILE_PRIMARY_COUNT)
  const moreActive = moreItems.some(i => i.href === pathname)

  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      <style>{`
        .vec-nav {
          position: fixed;
          z-index: 40;
          background: ${colors.surface};
          border-right: 1px solid ${colors.line};
        }
        .vec-nav-desktop-only { display: none; }
        .vec-nav-mobile-only { display: none; }
        /* Desktop: left rail, full item list */
        @media (min-width: 768px) {
          .vec-nav {
            top: 52px;
            left: 0;
            width: 200px;
            bottom: 0;
            display: flex;
            flex-direction: column;
            padding: ${spacing[3]}px ${spacing[2]}px;
            gap: 2px;
            border-bottom: none;
          }
          .vec-nav-desktop-only { display: contents; }
        }
        /* Mobile: bottom bar, primary items + More */
        @media (max-width: 767px) {
          .vec-nav {
            bottom: 0;
            left: 0;
            right: 0;
            height: 64px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-around;
            padding: 0 ${spacing[1]}px;
            border-top: 1px solid ${colors.line};
            border-right: none;
          }
          .vec-nav-mobile-only { display: contents; }
        }
      `}</style>
      <nav className="vec-nav" aria-label="Main navigation">
        <div className="vec-nav-desktop-only">
          {items.map(({ label, href, Icon }) => (
            <NavLink key={href} label={label} href={href} Icon={Icon} active={pathname === href} />
          ))}
        </div>
        <div className="vec-nav-mobile-only">
          {primaryItems.map(({ label, href, Icon }) => (
            <NavLink key={href} label={label} href={href} Icon={Icon} active={pathname === href} />
          ))}
          {moreItems.length > 0 && (
            <MoreButton active={moreActive} onClick={() => setMoreOpen(true)} />
          )}
        </div>
      </nav>

      {moreItems.length > 0 && (
        <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {moreItems.map(({ label, href, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing[3],
                  padding: `${spacing[3]}px ${spacing[2]}px`,
                  borderRadius: radii.md,
                  textDecoration: "none",
                  background: pathname === href ? colors.violetSoft : "transparent",
                  color: pathname === href ? colors.violet : colors.ink,
                }}
              >
                <Icon size={18} strokeWidth={pathname === href ? 2.5 : 1.75} />
                <span
                  style={{
                    fontFamily: fonts.body,
                    fontSize: fontSize.body,
                    fontWeight: pathname === href ? fontWeight.semibold : fontWeight.regular,
                  }}
                >
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </Modal>
      )}
    </>
  )
}

interface NavLinkProps {
  label: string
  href: string
  Icon: LucideIcon
  active: boolean
}

function NavLink({ label, href, Icon, active }: NavLinkProps) {
  return (
    <>
      <style>{`
        .vec-nav-link {
          display: flex;
          align-items: center;
          gap: ${spacing[2]}px;
          padding: ${spacing[2]}px ${spacing[3]}px;
          border-radius: ${radii.md}px;
          text-decoration: none;
          transition: background ${motion.fast} ${motion.ease};
          white-space: nowrap;
          overflow: hidden;
        }
        .vec-nav-link:hover {
          background: ${colors.violetSoft};
        }
        /* Mobile: stack vertically inside the link */
        @media (max-width: 767px) {
          .vec-nav-link {
            flex-direction: column;
            gap: 2px;
            padding: ${spacing[1]}px ${spacing[1]}px;
            border-radius: ${radii.sm}px;
            align-items: center;
            justify-content: center;
            flex: 1;
          }
        }
      `}</style>
      <Link
        href={href}
        className="vec-nav-link"
        style={{
          background: active ? colors.violetSoft : "transparent",
          color: active ? colors.violet : colors.muted,
        }}
      >
        <Icon size={16} strokeWidth={active ? 2.5 : 1.75} />
        <span
          style={{
            fontFamily: fonts.body,
            fontSize: fontSize.meta,
            fontWeight: active ? fontWeight.semibold : fontWeight.regular,
            color: active ? colors.violet : colors.muted,
            lineHeight: 1.2,
          }}
        >
          {label}
        </span>
      </Link>
    </>
  )
}

function MoreButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="vec-nav-link"
      style={{
        background: active ? colors.violetSoft : "transparent",
        color: active ? colors.violet : colors.muted,
        border: "none",
        cursor: "pointer",
        font: "inherit",
      }}
    >
      <MoreHorizontal size={16} strokeWidth={active ? 2.5 : 1.75} />
      <span
        style={{
          fontFamily: fonts.body,
          fontSize: fontSize.meta,
          fontWeight: active ? fontWeight.semibold : fontWeight.regular,
          color: active ? colors.violet : colors.muted,
          lineHeight: 1.2,
        }}
      >
        More
      </span>
    </button>
  )
}

export default Nav
