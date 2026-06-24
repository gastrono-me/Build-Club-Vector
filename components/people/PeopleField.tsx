"use client"

import React from "react"
import { CalendarDays, MessageCircle } from "lucide-react"
import type { NormalizedPerson } from "@/components/people/PersonCard"
import type { Profile } from "@/types/index"
import { useSocial } from "@/components/shell/SocialProvider"
import { complementScore, type ComplementResult } from "@/lib/match"
import { layoutField, type SimItem } from "@/lib/radar/similarity"
import { colors, fonts, fontSize, fontWeight, spacing, shadows, letterSpacing } from "@/lib/design/tokens"

// normalised (0-1) -> SVG user space (6px pad, 88/90% range) — matches the radar field.
function px(x: number) { return 6 + x * 88 }
function py(y: number) { return 96 - y * 90 }

const TOP_COMPLEMENTS = 5

export interface PeopleFieldProps {
  /** Everyone in the room except the signed-in user. */
  people: NormalizedPerson[]
  me: Profile | null
  meId: string | null
}

/**
 * The room as an embedding field of people — the Pulse twin of the Bottleneck
 * Radar. Attendees are positioned by interest similarity (so domains cluster),
 * and vectors shoot from you to the few people who most *complete* you:
 * reciprocal intent + complementary skills, every link explained. Tap a node to
 * see why, then request a catchup. Degrades to nothing when the room is too
 * sparse to be meaningful.
 */
export function PeopleField({ people, me, meId }: PeopleFieldProps) {
  const { openPanel } = useSocial()
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const meForMatch = React.useMemo(
    () => (me ? { tags: me.skills, industries: me.industries, looking: me.looking } : null),
    [me],
  )

  // Complement score for every other person, strongest first.
  const scored = React.useMemo(() => {
    const map: Record<string, ComplementResult> = {}
    for (const p of people) {
      map[p.id] = complementScore(meForMatch, { tags: p.tags, industries: p.industries, looking: p.looking })
    }
    return map
  }, [people, meForMatch])

  const topComplementIds = React.useMemo(() => {
    return [...people]
      .filter((p) => scored[p.id]?.score > 0)
      .sort((a, b) => scored[b.id].score - scored[a.id].score)
      .slice(0, TOP_COMPLEMENTS)
      .map((p) => p.id)
  }, [people, scored])
  const topSet = React.useMemo(() => new Set(topComplementIds), [topComplementIds])
  const maxScore = Math.max(1, ...topComplementIds.map((id) => scored[id].score))

  // Layout positions: position by interest space (skills + industries + looking),
  // anchored loosely by primary industry. Keyed on content so it's stable.
  const positions = React.useMemo(() => {
    if (!me || !meId) return {}
    const items: SimItem[] = [
      { id: meId, category: me.industries[0] ?? "Other", note: [...me.skills, ...me.industries, ...me.looking].join(" ") },
      ...people.map((p) => ({
        id: p.id,
        category: p.industries[0] ?? "Other",
        note: [...p.tags, ...p.industries, ...p.looking].join(" "),
      })),
    ]
    return layoutField(items)
  }, [people, me, meId])

  // Need a real profile and enough of a room for the field to mean anything.
  if (!me || !meId || people.length < 3) return null

  const selected = selectedId ? people.find((p) => p.id === selectedId) ?? null : null
  const selectedScore = selected ? scored[selected.id] : null
  const mePos = positions[meId]

  function asChatPerson(p: NormalizedPerson) {
    return { id: p.id, name: p.name, occupation: p.occupation, tags: p.tags, industries: p.industries, looking: p.looking, bio: p.bio, avatar: p.avatar }
  }

  return (
    <section
      aria-label="Embedding field of people in the room"
      style={{
        position: "relative",
        background: "#F4F6F9",
        border: `1.5px solid ${colors.ink}`,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: shadows.card,
        marginBottom: spacing[5],
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
        <span style={{ fontFamily: fonts.mono, fontSize: fontSize.label, letterSpacing: letterSpacing.label, textTransform: "uppercase", fontWeight: fontWeight.semibold, color: colors.ink }}>
          People field
        </span>
        <span style={{ fontFamily: fonts.mono, fontSize: fontSize.micro, letterSpacing: "0.04em", textTransform: "uppercase", color: colors.muted, display: "flex", alignItems: "center", gap: 6 }}>
          <span aria-hidden style={{ width: 9, height: 9, borderRadius: "50%", background: colors.violet, display: "inline-block" }} />
          your top complements
        </span>
      </div>

      {/* Plot stage */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 0.82" }}>
        <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}>
          {/* Grid */}
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
          <line x1={2} y1={98} x2={98} y2={98} stroke={colors.ink} strokeWidth={0.6} />
          <line x1={2} y1={98} x2={2} y2={2} stroke={colors.ink} strokeWidth={0.6} />

          {/* Complement vectors from you to your top people */}
          {mePos && topComplementIds.map((id) => {
            const p = positions[id]
            if (!p) return null
            const strength = scored[id].score / maxScore
            const isActive = selectedId === id
            return (
              <line
                key={id}
                x1={px(mePos.x)} y1={py(mePos.y)}
                x2={px(p.x)} y2={py(p.y)}
                stroke={colors.violet}
                strokeWidth={isActive ? 2.6 : 0.9 + strength * 1.8}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity={isActive ? 0.9 : 0.2 + strength * 0.5}
              />
            )
          })}
        </svg>

        {/* Nodes (HTML overlay so they're keyboard-focusable) */}
        {[{ id: meId, isMe: true }, ...people.map((p) => ({ id: p.id, isMe: false }))].map(({ id, isMe }) => {
          const pos = positions[id]
          if (!pos) return null
          const person = isMe ? null : people.find((p) => p.id === id)!
          const isTop = topSet.has(id)
          const isSelected = selectedId === id
          const radius = isMe ? 11 : isTop ? Math.min(8 + (scored[id].score / maxScore) * 6, 15) : 6
          const col = isMe || isTop ? colors.violet : colors.mutedSoft
          const label = isMe
            ? "This is you"
            : `${person!.name}${scored[id].score > 0 ? `. ${scored[id].headline ?? "complement"}.` : ""} Tap to ${isSelected ? "close" : "view"}.`
          return (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-pressed={isSelected}
              onClick={() => setSelectedId(isMe ? null : isSelected ? null : id)}
              style={{
                position: "absolute",
                left: `${px(pos.x)}%`,
                top: `${py(pos.y)}%`,
                transform: "translate(-50%, -50%)",
                width: 44, height: 44,
                display: "grid", placeItems: "center",
                background: "transparent", border: 0, cursor: isMe ? "default" : "pointer", padding: 0,
                zIndex: isMe ? 6 : 5, borderRadius: "50%",
              }}
            >
              <span
                style={{
                  width: radius * 2, height: radius * 2, borderRadius: "50%",
                  background: isMe ? colors.surface : col,
                  border: isMe ? `2.5px solid ${colors.violet}` : `2px solid #F4F6F9`,
                  boxShadow: isSelected
                    ? `0 0 0 2.5px ${colors.violet}, 0 0 0 5px rgba(43,43,245,0.18)`
                    : isTop ? `0 0 0 1.5px ${col}` : "none",
                  display: "block",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                  transform: isSelected ? "scale(1.3)" : "scale(1)",
                }}
              />
            </button>
          )
        })}

        {/* "you" tag near your node */}
        {mePos && (
          <span aria-hidden style={{ position: "absolute", left: `${px(mePos.x)}%`, top: `${py(mePos.y)}%`, transform: "translate(-50%, 14px)", fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.violet, pointerEvents: "none", whiteSpace: "nowrap" }}>
            you
          </span>
        )}

        {/* Selection panel */}
        {selected && selectedScore && (
          <div
            role="region"
            aria-label={`Detail: ${selected.name}`}
            style={{
              position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
              width: "min(340px, 92%)", background: colors.surface,
              border: `1.5px solid ${colors.ink}`, borderRadius: 10, boxShadow: shadows.modal,
              padding: `${spacing[3]}px ${spacing[4]}px`, zIndex: 20,
            }}
          >
            <div style={{ fontFamily: fonts.display, fontWeight: fontWeight.semibold, fontSize: fontSize.heading, color: colors.ink }}>
              {selected.name}
            </div>
            {selected.occupation && (
              <div style={{ fontFamily: fonts.body, fontSize: fontSize.meta, color: colors.muted, marginBottom: spacing[2] }}>
                {selected.occupation}
              </div>
            )}
            {/* Why you two — explained, never opaque */}
            {selectedScore.reasons.length > 0 ? (
              <ul style={{ margin: `0 0 ${spacing[3]}px`, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 3 }}>
                {selectedScore.reasons.map((r) => (
                  <li key={r} style={{ fontFamily: fonts.body, fontSize: fontSize.meta, color: colors.ink, display: "flex", gap: 7, alignItems: "baseline" }}>
                    <span aria-hidden style={{ color: colors.violet, fontSize: 12, lineHeight: 1 }}>→</span>
                    {r}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ fontFamily: fonts.body, fontSize: fontSize.meta, color: colors.muted, marginBottom: spacing[3] }}>
                No strong overlap yet — say hi anyway.
              </div>
            )}
            <div style={{ display: "flex", gap: spacing[2] }}>
              <button
                type="button"
                onClick={() => openPanel(asChatPerson(selected), "catchup")}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 999, border: "none", background: colors.violet, color: colors.onDark, fontFamily: fonts.mono, fontSize: fontSize.label, letterSpacing: "0.03em", cursor: "pointer" }}
              >
                <CalendarDays size={13} /> Request catchup
              </button>
              <button
                type="button"
                onClick={() => openPanel(asChatPerson(selected), "chat")}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 999, border: `1.5px solid ${colors.line}`, background: "transparent", color: colors.ink, fontFamily: fonts.mono, fontSize: fontSize.label, letterSpacing: "0.03em", cursor: "pointer" }}
              >
                <MessageCircle size={13} /> Message
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default PeopleField
