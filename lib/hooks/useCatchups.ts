"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export interface CatchupRow {
  id: string
  person_id: string
  person_name?: string | null
  day: number
  start_min: number
  end_min: number
}

export function useCatchups() {
  const [catchups, setCatchups] = useState<CatchupRow[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data, error } = await supabase
        .from("catchups").select("id, person_id, person_name, day, start_min, end_min").eq("user_id", user.id)
      if (error) console.error("[useCatchups] fetch error:", error)
      if (data) setCatchups(data as CatchupRow[])
      setLoading(false)
    }
    init()
  }, [])

  // One catchup per person: replace any existing one for that person.
  const add = useCallback((personId: string, day: number, startMin: number, personName?: string) => {
    if (!userId) return
    const endMin = startMin + 15
    const supabase = createClient()
    // Remove existing for this person locally + remotely, then insert.
    setCatchups(prev => prev.filter(c => c.person_id !== personId))
    supabase.from("catchups").delete().match({ user_id: userId, person_id: personId })
      .then(() =>
        supabase.from("catchups")
          .insert({ user_id: userId, person_id: personId, person_name: personName ?? null, day, start_min: startMin, end_min: endMin })
          .select("id, person_id, person_name, day, start_min, end_min").single()
          .then(({ data, error }) => {
            if (error || !data) { console.error("[useCatchups] add error:", error); return }
            setCatchups(prev => [...prev.filter(c => c.person_id !== personId), data as CatchupRow])
          })
      )
  }, [userId])

  const cancel = useCallback((catchupId: string) => {
    if (!userId) return
    let removed: CatchupRow | undefined
    setCatchups(prev => {
      removed = prev.find(c => c.id === catchupId)
      return prev.filter(c => c.id !== catchupId)
    })
    createClient().from("catchups").delete().match({ user_id: userId, id: catchupId })
      .then(({ error }) => { if (error && removed) setCatchups(prev => [...prev, removed!]) })
  }, [userId])

  return { catchups, add, cancel, loading }
}
