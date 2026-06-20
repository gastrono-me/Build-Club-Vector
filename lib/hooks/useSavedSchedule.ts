"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export interface UseSavedScheduleResult {
  saved: Set<string>
  toggle: (sessionId: string) => void
  loading: boolean
}

export function useSavedSchedule(): UseSavedScheduleResult {
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)

      const { data } = await supabase
        .from("saved_sessions")
        .select("session_id")
      // RLS ensures only the current user's rows are returned
      if (data) {
        setSaved(new Set(data.map((row: { session_id: string }) => row.session_id)))
      }
      setLoading(false)
    }

    init()
  }, [])

  const toggle = useCallback((sessionId: string) => {
    if (!userId) return

    const supabase = createClient()
    const isSaved = saved.has(sessionId)

    // Optimistic update
    setSaved(prev => {
      const next = new Set(prev)
      if (isSaved) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      return next
    })

    if (isSaved) {
      supabase
        .from("saved_sessions")
        .delete()
        .eq("session_id", sessionId)
        .then(({ error }) => {
          if (error) {
            // Revert on error
            setSaved(prev => {
              const next = new Set(prev)
              next.add(sessionId)
              return next
            })
          }
        })
    } else {
      supabase
        .from("saved_sessions")
        .insert({ user_id: userId, session_id: sessionId })
        .then(({ error }) => {
          if (error) {
            // Revert on error
            setSaved(prev => {
              const next = new Set(prev)
              next.delete(sessionId)
              return next
            })
          }
        })
    }
  }, [userId, saved])

  return { saved, toggle, loading }
}
