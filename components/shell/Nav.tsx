"use client"

import React from "react"
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
  type LucideIcon,
} from "lucide-react"
import { colors, fonts, fontSize, fontWeight, spacing, radii, motion } from "@/lib/design/tokens"

function deriveMode(pathname: string): "pulse" | "line" {
  return pathname === "/deadline" || pathname === "/radar" ? "line" : "pulse"
}

interface NavItem {
  label: string
  href: string
  Icon: LucideIcon
}

const PULSE_ITEMS: NavItem[] = [
  { label: "Now", href: "/", Icon: Zap },
  { label: "Discover", href: "/discover", Icon: Compass },
  { label: "People", href: "/people", Icon: Users },
  { label: "Maps", href: "/maps", Icon: Map },
  { label: "Schedule", href: "/schedule", Icon: Calendar },
  { label: "Ask Clawbie", href: "/clawbie", Icon: MessageCircle },
]

const LINE_ITEMS: NavItem[] = [
  { label: "Deadline Guardian", href: "/deadline", Icon: Clock },
  { label: "Bottleneck Radar", href: "/radar", Icon: Activity },
]

export function Nav() {
  const pathname = usePathname()
  const mode = deriveMode(pathname)
  const items = mode === "pulse" ? PULSE_ITEMS : LINE_ITEMS

  return (
    <>
      <style>{`
        .vec-nav {
          position: fixed;
          z-index: 40;
          background: ${colors.surface};
          border-right: 1px solid ${colors.line};
        }
        /* Desktop: left rail */
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
        }
        /* Mobile: bottom bar */
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
        }
      `}</style>
      <nav className="vec-nav" aria-label="Main navigation">
        {items.map(({ label, href, Icon }) => {
          const active = pathname === href
          return (
            <NavLink
              key={href}
              label={label}
              href={href}
              Icon={Icon}
              active={active}
            />
          )
        })}
      </nav>
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

export default Nav
