"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { RadarFeed } from "@/components/radar/RadarFeed"
import { colors, spacing } from "@/lib/design/tokens"

export default function RadarPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login")
      } else {
        setChecked(true)
      }
    })
  }, [router])

  if (!checked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: colors.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.surface,
        padding: spacing[4],
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: spacing[12] }}>
        <RadarFeed />
      </div>
    </div>
  )
}
