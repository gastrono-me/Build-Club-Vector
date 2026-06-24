"use client"

import React from "react"
import { useRadar } from "@/lib/hooks/useRadar"
import { PostBlocker } from "@/components/radar/PostBlocker"
import { BlockerCard } from "@/components/radar/BlockerCard"
import { EmbeddingPlot } from "@/components/radar/EmbeddingPlot"
import { BuildLogFeed } from "@/components/radar/BuildLogFeed"
import { colors, fonts, fontSize, fontWeight, radii, spacing, letterSpacing } from "@/lib/design/tokens"

type FeedTab = "stuck" | "shipped"

export function RadarFeed() {
  const [tab, setTab] = React.useState<FeedTab>("stuck")
  const { blockers, loading, post, toggleMeToo, meTooCounts, mineMeToo, userId } = useRadar()
  const [latestId, setLatestId] = React.useState<string | null>(null)
  const latestTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track the most-recently posted blocker (newest created_at in the array).
  // Runs whenever blockers update — first blocker (desc order) is the newest.
  React.useEffect(() => {
    if (blockers.length === 0) return
    const newest = blockers[0]
    const age = Date.now() - new Date(newest.created_at).getTime()
    if (age < 10_000) {
      setLatestId(newest.id)
      if (latestTimer.current) clearTimeout(latestTimer.current)
      latestTimer.current = setTimeout(() => setLatestId(null), 8_000)
    }
  }, [blockers])

  React.useEffect(() => {
    return () => {
      if (latestTimer.current) clearTimeout(latestTimer.current)
    }
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing[6] }}>
      {/* Stuck / Shipped toggle */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 2,
          background: colors.line,
          borderRadius: radii.pill,
          padding: 2,
        }}
      >
        {(["stuck", "shipped"] as FeedTab[]).map(t => {
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontFamily: fonts.mono,
                fontSize: fontSize.label,
                fontWeight: fontWeight.semibold,
                padding: `${spacing[1]}px ${spacing[3]}px`,
                borderRadius: radii.pill,
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.05em",
                lineHeight: 1.4,
                background: active ? colors.violet : "transparent",
                color: active ? colors.onDark : colors.mutedSoft,
                textTransform: "uppercase",
              }}
            >
              {t === "stuck" ? "Stuck" : "Shipped"}
            </button>
          )
        })}
      </div>

      {tab === "shipped" && <BuildLogFeed />}

      {tab === "stuck" && (
        <>
      {/* Heading */}
      <header>
        <h1
          style={{
            fontFamily: fonts.display,
            fontWeight: fontWeight.semibold,
            fontSize: "clamp(38px, 9vw, 60px)",
            lineHeight: 0.96,
            letterSpacing: "-0.035em",
            margin: 0,
            color: colors.ink,
          }}
        >
          Where the room is{" "}
          <em style={{ fontStyle: "italic", color: colors.violet }}>stuck</em>.
        </h1>
        <p
          style={{
            marginTop: spacing[3],
            maxWidth: "46ch",
            color: colors.muted,
            fontSize: 15.5,
            fontFamily: fonts.body,
          }}
        >
          Every blocker is a point in the field. Tap{" "}
          <strong style={{ color: colors.ink, fontWeight: fontWeight.semibold }}>me too</strong>{" "}
          and a vector links you to whoever&rsquo;s stuck on the same thing.
        </p>
        {/* Live pulse indicator */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontFamily: fonts.mono,
            fontSize: fontSize.label,
            color: colors.violet,
            letterSpacing: letterSpacing.label,
            marginTop: spacing[2],
          }}
        >
          <span
            aria-hidden
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: colors.violet,
              display: "inline-block",
              animation: "radarPulse 2s ease-in-out infinite",
            }}
          />
          LIVE
        </div>
      </header>

      {/* Hero: Embedding Plot */}
      <EmbeddingPlot
        blockers={blockers}
        meTooCounts={meTooCounts}
        mineMeToo={mineMeToo}
        userId={userId}
        onMeToo={toggleMeToo}
        latestId={latestId}
      />

      {/* Post blocker composer */}
      <PostBlocker onPost={post} />

      {/* Compact blocker list */}
      <section aria-label="All blockers">
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: fontSize.label,
            letterSpacing: letterSpacing.label,
            textTransform: "uppercase",
            color: colors.muted,
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: spacing[3],
          }}
        >
          <span
            aria-hidden
            style={{ color: colors.violet, fontSize: 13, lineHeight: 1 }}
          >
            →
          </span>
          All blockers
          {!loading && (
            <span style={{ color: colors.mutedSoft, fontSize: fontSize.micro }}>
              {blockers.length}
            </span>
          )}
        </div>

        {loading ? (
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: fontSize.label,
              color: colors.mutedSoft,
              letterSpacing: letterSpacing.label,
              textAlign: "center",
              padding: `${spacing[8]}px 0`,
            }}
          >
            Loading…
          </div>
        ) : blockers.length === 0 ? (
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: fontSize.body,
              color: colors.muted,
              textAlign: "center",
              padding: `${spacing[8]}px 0`,
            }}
          >
            No blockers yet. Be the first to post one.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
            {blockers.map((blocker) => (
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
        )}
      </section>
        </>
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
