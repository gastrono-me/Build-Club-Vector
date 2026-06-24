"use client"

import React from "react"
import type { BlockerRow } from "@/lib/hooks/useRadar"
import { colors, fonts, fontSize, fontWeight, spacing, shadows, letterSpacing } from "@/lib/design/tokens"

// ---- Cluster anchors (normalised 0-1 in plot space) ----
const CATEGORY_ANCHORS: Record<string, { x: number; y: number }> = {
  "RAG/Retrieval":    { x: 0.27, y: 0.65 },
  "hackathon help":   { x: 0.62, y: 0.78 },
  "Deploy/Infra":     { x: 0.78, y: 0.22 },
  "Agent loops":      { x: 0.45, y: 0.72 },
  "Auth/Login":       { x: 0.20, y: 0.30 },
  "Rate limits/Cost": { x: 0.68, y: 0.38 },
  "UI polish":        { x: 0.35, y: 0.48 },
  "Demo prep":        { x: 0.55, y: 0.85 },
  "Data/Eval":        { x: 0.30, y: 0.55 },
  "Other":            { x: 0.50, y: 0.45 },
}

function hashCode(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i)
    h = h >>> 0
  }
  return h
}

function nodePosition(id: string, category: string): { x: number; y: number } {
  const anchor = CATEGORY_ANCHORS[category] ?? { x: 0.50, y: 0.45 }
  const h = hashCode(id)
  const jx = ((h & 0xFF) / 255 - 0.5) * 0.18
  const jy = (((h >> 8) & 0xFF) / 255 - 0.5) * 0.18
  return {
    x: Math.max(0.06, Math.min(0.94, anchor.x + jx)),
    y: Math.max(0.06, Math.min(0.94, anchor.y + jy)),
  }
}

// Coordinate transforms: normalised (0-1) -> SVG user space (margins: 6px pad, 90% range)
function px(x: number) { return 6 + x * 88 }
function py(y: number) { return 96 - y * 90 }  // invert: higher y plotted upward

// Category dot colors
const CATEGORY_COLORS: Record<string, string> = {
  "RAG/Retrieval":    colors.ink,
  "hackathon help":   colors.violet,
  "Deploy/Infra":     colors.oxblood,
  "Agent loops":      colors.violet,
  "Auth/Login":       colors.ink,
  "Rate limits/Cost": colors.muted,
  "UI polish":        colors.muted,
  "Demo prep":        colors.violet,
  "Data/Eval":        colors.ink,
  "Other":            colors.muted,
}

function catColor(category: string): string {
  return CATEGORY_COLORS[category] ?? colors.ink
}

export interface EmbeddingPlotProps {
  blockers: BlockerRow[]
  meTooCounts: Record<string, number>
  mineMeToo: Set<string>
  userId: string | null
  onMeToo: (id: string) => Promise<void>
  /** Most-recently posted blocker id (to show "just posted" emphasis) */
  latestId?: string | null
  /** Blocker id that just took a cross-client "me too" (transient pulse). */
  pulseId?: string | null
}

export function EmbeddingPlot({
  blockers,
  meTooCounts,
  mineMeToo,
  userId,
  onMeToo,
  latestId,
  pulseId,
}: EmbeddingPlotProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [voting, setVoting] = React.useState(false)
  const [reduceMotion] = React.useState(
    () => typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  )

  // Compute node positions (stable — based on id, not array order)
  const positions = React.useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {}
    for (const b of blockers) {
      map[b.id] = nodePosition(b.id, b.category)
    }
    return map
  }, [blockers])

  // Compute vector lines: for each blocker, link to nearest same-category neighbour
  const links = React.useMemo(() => {
    const result: Array<{ a: string; b: string }> = []
    const seen = new Set<string>()
    for (const b of blockers) {
      const pos = positions[b.id]
      if (!pos) continue
      let bestId: string | null = null
      let bestDist = Infinity
      for (const other of blockers) {
        if (other.id === b.id || other.category !== b.category) continue
        const opos = positions[other.id]
        if (!opos) continue
        const d = Math.hypot(pos.x - opos.x, pos.y - opos.y)
        if (d < bestDist) { bestDist = d; bestId = other.id }
      }
      if (bestId) {
        const key = [b.id, bestId].sort().join("|")
        if (!seen.has(key)) {
          seen.add(key)
          result.push({ a: b.id, b: bestId })
        }
      }
    }
    return result
  }, [blockers, positions])

  const selectedBlocker = blockers.find((b) => b.id === selectedId) ?? null

  async function handleMeToo(id: string) {
    if (!userId || voting) return
    setVoting(true)
    try {
      await onMeToo(id)
    } finally {
      setVoting(false)
    }
  }

  // Legend categories actually present in data (show at most 3)
  const presentCategories = React.useMemo(() => {
    const s = new Set(blockers.map((b) => b.category))
    const priority = ["RAG/Retrieval", "hackathon help", "Deploy/Infra"]
    const shown = priority.filter((c) => s.has(c))
    if (shown.length < 3) {
      for (const c of s) {
        if (!shown.includes(c) && shown.length < 3) shown.push(c)
      }
    }
    return shown
  }, [blockers])

  return (
    <section
      aria-label="Embedding field of current blockers"
      style={{
        position: "relative",
        background: "#F4F6F9",
        border: `1.5px solid ${colors.ink}`,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: shadows.card,
      }}
    >
      {/* Header strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: spacing[3],
          padding: "9px 13px",
          borderBottom: `1.5px solid ${colors.ink}`,
          background: colors.surface,
        }}
      >
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: fontSize.label,
            letterSpacing: letterSpacing.label,
            textTransform: "uppercase",
            fontWeight: fontWeight.semibold,
            color: colors.ink,
          }}
        >
          Bottleneck Radar
        </span>
        {/* Legend */}
        <div aria-hidden style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {presentCategories.map((cat) => (
            <span
              key={cat}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: fonts.mono,
                fontSize: fontSize.micro,
                letterSpacing: "0.03em",
                color: colors.muted,
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: catColor(cat),
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {cat.split("/")[0]}
            </span>
          ))}
        </div>
      </div>

      {/* Plot stage */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 0.82",
        }}
      >
        {/* SVG field */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
          }}
        >
          {/* Grid lines */}
          {Array.from({ length: 9 }, (_, i) => i + 1).map((i) => {
            const v = i * 10
            const isCenter = i === 5
            const stroke = isCenter ? "#c2cad6" : "#dce2ea"
            const sw = isCenter ? 0.5 : 0.3
            const dash = isCenter ? undefined : "1.2 1.6"
            return (
              <React.Fragment key={i}>
                <line x1={v} y1={0} x2={v} y2={100} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} />
                <line x1={0} y1={v} x2={100} y2={v} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} />
              </React.Fragment>
            )
          })}
          {/* Axes */}
          <line x1={2} y1={98} x2={98} y2={98} stroke={colors.ink} strokeWidth={0.6} />
          <line x1={2} y1={98} x2={2} y2={2} stroke={colors.ink} strokeWidth={0.6} />

          {/* Vector lines between same-category neighbours */}
          {links.map(({ a, b }) => {
            const pa = positions[a]
            const pb = positions[b]
            if (!pa || !pb) return null
            const wa = meTooCounts[a] ?? 0
            const wb = meTooCounts[b] ?? 0
            const w = Math.min(wa, wb)
            const sw = Math.max(0.8, Math.min(7, 0.7 + w * 0.16))
            const opacity = w > 0 ? Math.min(0.85, 0.25 + w * 0.03) : 0.12
            // Emphasise lines involving the selected node
            const isActive = selectedId === a || selectedId === b
            return (
              <line
                key={`${a}|${b}`}
                x1={px(pa.x)} y1={py(pa.y)}
                x2={px(pb.x)} y2={py(pb.y)}
                stroke={colors.violet}
                strokeWidth={isActive ? Math.max(sw, 2.5) : sw}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity={isActive ? 0.85 : opacity}
                style={{ transition: reduceMotion ? "none" : "stroke-width 0.35s ease, opacity 0.35s ease" }}
              />
            )
          })}
        </svg>

        {/* Axis labels */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            bottom: 7,
            right: 11,
            fontFamily: fonts.mono,
            fontSize: 9.5,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: colors.muted,
            pointerEvents: "none",
          }}
        >
          retrieval&nbsp;→&nbsp;shipping
        </span>
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 11,
            left: 9,
            fontFamily: fonts.mono,
            fontSize: 9.5,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: colors.muted,
            pointerEvents: "none",
            transformOrigin: "left top",
            transform: "rotate(90deg) translateY(-100%)",
            whiteSpace: "nowrap",
          }}
        >
          tooling&nbsp;→&nbsp;model
        </span>
        <span
          aria-hidden
          style={{
            position: "absolute",
            bottom: 7,
            left: 9,
            fontFamily: fonts.mono,
            fontSize: 9.5,
            color: "#9aa2af",
            pointerEvents: "none",
          }}
        >
          0,0
        </span>

        {/* Live blip */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 11,
            right: 11,
            zIndex: 6,
            fontFamily: fonts.mono,
            fontSize: 9.5,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: colors.violet,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: colors.violet,
              display: "inline-block",
              animation: reduceMotion ? "none" : "plotPing 1.9s ease-out infinite",
            }}
          />
          live
        </span>

        {/* Node buttons (overlaid HTML so they're keyboard focusable) */}
        {blockers.map((b) => {
          const pos = positions[b.id]
          if (!pos) return null
          const count = meTooCounts[b.id] ?? 0
          const isSelected = selectedId === b.id
          const isOwn = !!userId && b.author_id === userId
          const isLatest = b.id === latestId
          const isPulse = b.id === pulseId
          const col = isOwn || isLatest || isPulse ? colors.violet : catColor(b.category)
          // Radius: 8px base + 0.5px per me-too, capped at 20px
          const radius = Math.min(8 + count * 0.5, 20)
          return (
            <button
              key={b.id}
              type="button"
              aria-label={`${b.category}: ${b.note} — ${count} me too. Tap to ${isSelected ? "close" : "view"}.`}
              aria-pressed={isSelected}
              onClick={() => setSelectedId(isSelected ? null : b.id)}
              style={{
                position: "absolute",
                left: `${px(pos.x)}%`,
                top: `${py(pos.y)}%`,
                transform: "translate(-50%, -50%)",
                width: 44,
                height: 44,
                display: "grid",
                placeItems: "center",
                background: "transparent",
                border: 0,
                cursor: "pointer",
                padding: 0,
                zIndex: 5,
                borderRadius: "50%",
              }}
            >
              <span
                style={{
                  width: radius * 2,
                  height: radius * 2,
                  borderRadius: "50%",
                  background: col,
                  border: `2px solid #F4F6F9`,
                  boxShadow: isSelected
                    ? `0 0 0 2.5px ${colors.violet}, 0 0 0 5px rgba(43,43,245,0.18)`
                    : `0 0 0 1.5px ${col}`,
                  display: "block",
                  transition: reduceMotion
                    ? "none"
                    : "transform 0.18s ease, box-shadow 0.18s ease, width 0.32s cubic-bezier(0.34,1.56,0.64,1), height 0.32s cubic-bezier(0.34,1.56,0.64,1)",
                  transform: isSelected ? "scale(1.35)" : "scale(1)",
                  animation: (isLatest || isPulse) && !reduceMotion ? "plotPing 1.9s ease-out infinite" : "none",
                }}
              />
            </button>
          )
        })}

        {/* Selection panel */}
        {selectedBlocker && (
          <div
            role="region"
            aria-label={`Detail: ${selectedBlocker.note}`}
            style={{
              position: "absolute",
              bottom: 28,
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(320px, 90%)",
              background: colors.surface,
              border: `1.5px solid ${colors.ink}`,
              borderRadius: 10,
              boxShadow: shadows.modal,
              padding: `${spacing[3]}px ${spacing[4]}px`,
              zIndex: 20,
            }}
          >
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: fontSize.micro,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: catColor(selectedBlocker.category),
                marginBottom: spacing[1],
              }}
            >
              {selectedBlocker.category}
            </div>
            <p
              style={{
                margin: `0 0 ${spacing[2]}px`,
                fontFamily: fonts.body,
                fontSize: fontSize.body,
                color: colors.ink,
                lineHeight: 1.45,
              }}
            >
              {selectedBlocker.note}
            </p>
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: fontSize.micro,
                color: colors.muted,
                marginBottom: spacing[3],
              }}
            >
              {selectedBlocker.author_id == null
                ? "Community"
                : (selectedBlocker.author_name ?? "Attendee")}
            </div>
            {/* Me too button */}
            <button
              type="button"
              disabled={
                voting ||
                !userId ||
                (!!userId && selectedBlocker.author_id === userId)
              }
              aria-pressed={mineMeToo.has(selectedBlocker.id)}
              onClick={() => handleMeToo(selectedBlocker.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 999,
                border: `1.5px solid ${mineMeToo.has(selectedBlocker.id) ? colors.violet : colors.line}`,
                background: mineMeToo.has(selectedBlocker.id) ? colors.violet : "transparent",
                color: mineMeToo.has(selectedBlocker.id) ? colors.onDark : colors.ink,
                fontFamily: fonts.mono,
                fontSize: fontSize.label,
                letterSpacing: "0.03em",
                cursor: (voting || !userId || selectedBlocker.author_id === userId) ? "not-allowed" : "pointer",
                opacity: (!userId || selectedBlocker.author_id === userId) ? 0.45 : 1,
                transition: reduceMotion ? "none" : "background 0.15s ease, border-color 0.15s ease",
              }}
            >
              <span style={{ fontSize: 13, lineHeight: 1, color: mineMeToo.has(selectedBlocker.id) ? colors.onDark : colors.violet }}>→</span>
              me too
              <span
                style={{
                  fontWeight: 600,
                  minWidth: 14,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {meTooCounts[selectedBlocker.id] ?? 0}
              </span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes plotPing {
          0%   { box-shadow: 0 0 0 1.5px #2B2BF5, 0 0 0 0 rgba(43,43,245,.45); }
          70%  { box-shadow: 0 0 0 1.5px #2B2BF5, 0 0 0 13px rgba(43,43,245,0); }
          100% { box-shadow: 0 0 0 1.5px #2B2BF5, 0 0 0 0 rgba(43,43,245,0); }
        }
      `}</style>
    </section>
  )
}

export default EmbeddingPlot
