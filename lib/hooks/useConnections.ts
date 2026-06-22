"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export function useConnections() {
  const [connections, setConnections] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data, error } = await supabase
        .from("connections").select("person_id").eq("user_id", user.id)
      if (error) console.error("[useConnections] fetch error:", error)
      if (data) setConnections(new Set(data.map((r: { person_id: string }) => r.person_id)))
      setLoading(false)
    }
    init()
  }, [])

  const toggle = useCallback((personId: string) => {
    if (!userId) return
    let had = false
    setConnections(prev => {
      had = prev.has(personId)
      const next = new Set(prev)
      had ? next.delete(personId) : next.add(personId)
      return next
    })
    const revert = () => setConnections(prev => {
      const next = new Set(prev)
      had ? next.add(personId) : next.delete(personId)
      return next
    })
    const supabase = createClient()
    if (had) {
      supabase.from("connections").delete()
        .match({ user_id: userId, person_id: personId })
        .then(({ error }) => { if (error) revert() })
    } else {
      supabase.from("connections").insert({ user_id: userId, person_id: personId })
        .then(({ error }) => { if (error) revert() })
    }
  }, [userId])

  return { connections, toggle, loading }
}
