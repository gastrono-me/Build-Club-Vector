"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export interface ChatMsg { sender: "me" | "them"; body: string }

export function useChat(personId: string | null) {
  const [thread, setThread] = useState<ChatMsg[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!personId) { setThread([]); return }
    let cancelled = false
    setLoading(true)
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      if (!cancelled) setUserId(user.id)
      const { data, error } = await supabase
        .from("chat_messages").select("sender, body")
        .eq("user_id", user.id).eq("person_id", personId)
        .order("created_at", { ascending: true })
      if (cancelled) return
      if (error) console.error("[useChat] fetch error:", error)
      setThread((data as ChatMsg[]) ?? [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [personId])

  const append = useCallback(async (m: ChatMsg) => {
    if (!userId || !personId) return
    setThread(prev => [...prev, m])
    const { error } = await createClient()
      .from("chat_messages")
      .insert({ user_id: userId, person_id: personId, sender: m.sender, body: m.body })
    if (error) console.error("[useChat] insert error:", error)
  }, [userId, personId])

  return { thread, append, loading }
}
