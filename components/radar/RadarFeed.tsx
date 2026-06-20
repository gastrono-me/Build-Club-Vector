"use client"

import React from "react"
import { useRadar } from "@/lib/hooks/useRadar"
import { PostBlocker } from "@/components/radar/PostBlocker"
import { BlockerCard } from "@/components/radar/BlockerCard"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { colors, fonts, fontSize, fontWeight, spacing, letterSpacing } from "@/lib/design/tokens"

export function RadarFeed() {
  const { blockers, loading, post, toggleMeToo, meTooCounts, mineMeToo, userId } = useRadar()

  // Group blockers by category, preserving insertion order of first occurrence
  const groups = React.useMemo(() => {
    const map = new Map<string, typeof blockers>()
    for (const b of blockers) {
      if (!map.has(b.category)) map.set(b.category, [])
      map.get(b.category)!.push(b)
    }
    return map
  }, [blockers])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing[6] }}>
      {/* Hero header */}
      <div>
        <SectionTitle
          kicker="Bottleneck Radar"
          title="What's blocking people?"
          note="Post your blocker, see who shares it. Updates live across all tabs."
        />
        {/* Live pulse indicator */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontFamily: fonts.mono,
            fontSize: fontSize.label,
            color: colors.live,
            letterSpacing: letterSpacing.label,
            marginTop: spacing[1],
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: colors.live,
              display: "inline-block",
              animation: "radarPulse 2s ease-in-out infinite",
            }}
          />
          LIVE
        </div>
      </div>

      {/* Post form */}
      <PostBlocker onPost={post} />

      {/* Feed */}
      {loading ? (
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: fontSize.label,
            color: colors.mutedSoft,
            letterSpacing: letterSpacing.label,
            textAlign: "center" as const,
            padding: `${spacing[8]}px 0`,
          }}
        >
          Loading…
        </div>
      ) : groups.size === 0 ? (
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: fontSize.body,
            color: colors.muted,
            textAlign: "center" as const,
            padding: `${spacing[8]}px 0`,
          }}
        >
          No blockers yet. Be the first to post one.
        </div>
      ) : (
        Array.from(groups.entries()).map(([category, items]) => (
          <section key={category}>
            {/* Category heading */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing[2],
                marginBottom: spacing[3],
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 14,
                  height: 2,
                  background: colors.live,
                  borderRadius: 2,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <h3
                style={{
                  margin: 0,
                  fontFamily: fonts.mono,
                  fontSize: fontSize.label,
                  fontWeight: fontWeight.medium,
                  color: colors.live,
                  letterSpacing: letterSpacing.label,
                  textTransform: "uppercase" as const,
                }}
              >
                {category}
              </h3>
              <span
                style={{
                  fontFamily: fonts.mono,
                  fontSize: fontSize.micro,
                  color: colors.mutedSoft,
                  letterSpacing: "0.04em",
                  marginLeft: 2,
                }}
              >
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
              {items.map((blocker) => (
                <BlockerCard
                  key={blocker.id}
                  blocker={blocker}
                  metooCount={meTooCounts[blocker.id] ?? 0}
                  isMine={mineMeToo.has(blocker.id)}
                  isOwn={!!userId && blocker.author_id === userId}
                  currentUserId={userId}
                  onMeToo={() => toggleMeToo(blocker.id)}
                />
              ))}
            </div>
          </section>
        ))
      )}

      <style>{`
        @keyframes radarPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  )
}

export default RadarFeed
