"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ProfileForm } from "@/components/profile/ProfileForm"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { colors, spacing } from "@/lib/design/tokens"

export default function ProfilePage() {
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
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionTitle
          kicker="Your account"
          title="Profile"
          note="Visible to other attendees. Keep it honest."
        />
        <ProfileForm />
      </div>
    </div>
  )
}
