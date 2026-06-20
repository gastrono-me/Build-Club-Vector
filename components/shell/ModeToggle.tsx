"use client"

import React from "react"
import { usePathname, useRouter } from "next/navigation"
import { colors, fonts, fontSize, fontWeight, radii, spacing, motion } from "@/lib/design/tokens"

function deriveMode(pathname: string): "pulse" | "line" {
  return pathname === "/deadline" || pathname === "/radar" ? "line" : "pulse"
}

export function ModeToggle() {
  const pathname = usePathname()
  const router = useRouter()
  const mode = deriveMode(pathname)

  const pillBase: React.CSSProperties = {
    fontFamily: fonts.mono,
    fontSize: fontSize.label,
    fontWeight: fontWeight.semibold,
    padding: `${spacing[1]}px ${spacing[3]}px`,
    borderRadius: radii.pill,
    border: "none",
    cursor: "pointer",
    transition: `background ${motion.fast} ${motion.ease}, color ${motion.fast} ${motion.ease}`,
    letterSpacing: "0.05em",
    lineHeight: 1.4,
  }

  const activeStyle: React.CSSProperties = {
    background: colors.violet,
    color: colors.onDark,
  }

  const inactiveStyle: React.CSSProperties = {
    background: "transparent",
    color: colors.mutedSoft,
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        background: colors.line,
        borderRadius: radii.pill,
        padding: 2,
      }}
    >
      <button
        onClick={() => router.push("/")}
        style={{
          ...pillBase,
          ...(mode === "pulse" ? activeStyle : inactiveStyle),
        }}
      >
        Pulse
      </button>
      <button
        onClick={() => router.push("/deadline")}
        style={{
          ...pillBase,
          ...(mode === "line" ? activeStyle : inactiveStyle),
        }}
      >
        Line
      </button>
    </div>
  )
}

export default ModeToggle
