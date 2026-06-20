"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

export interface BlockerRow {
  id: string
  author_id: string | null
  category: string
  note: string
  created_at: string
  /** Joined from profiles — may be null for seed/community posts */
  author_name?: string | null
  author_avatar?: string | null
}

export function useRadar() {
  const [blockers, setBlockers] = useState<BlockerRow[]>([])
  const [meTooCounts, setMeTooCounts] = useState<Record<string, number>>({})
  const [mineMeToo, setMineMeToo] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  // Keep userId in a ref so realtime callback can access latest value without stale closure
  const userIdRef = useRef<string | null>(null)

  const fetchAll = useCallback(async () => {
    const supabase = createClient()

    // Get current user (may be null during initial load)
    const { data: { user } } = await supabase.auth.getUser()
    const uid = user?.id ?? null
    userIdRef.current = uid
    setUserId(uid)

    // Fetch blockers + author profile in one join
    const { data: blockerData, error: blockerErr } = await supabase
      .from("blockers")
      .select(`
        id,
        author_id,
        category,
        note,
        created_at,
        profiles:author_id ( name, avatar_url )
      `)
      .order("created_at", { ascending: false })

    if (blockerErr) {
      console.error("[useRadar] blockers fetch error:", blockerErr)
    }

    // Fetch all me-too rows
    const { data: metooData, error: metooErr } = await supabase
      .from("blocker_metoo")
      .select("blocker_id, user_id")

    if (metooErr) {
      console.error("[useRadar] me-too fetch error:", metooErr)
    }

    // Build meTooCounts map
    const counts: Record<string, number> = {}
    const mine = new Set<string>()
    for (const row of metooData ?? []) {
      counts[row.blocker_id] = (counts[row.blocker_id] ?? 0) + 1
      if (uid && row.user_id === uid) {
        mine.add(row.blocker_id)
      }
    }

    // Normalize blocker rows — profiles join returns object or null
    const normalized: BlockerRow[] = (blockerData ?? []).map((b: any) => ({
      id: b.id,
      author_id: b.author_id,
      category: b.category,
      note: b.note,
      created_at: b.created_at,
      author_name: b.profiles?.name ?? null,
      author_avatar: b.profiles?.avatar_url ?? null,
    }))

    setBlockers(normalized)
    setMeTooCounts(counts)
    setMineMeToo(mine)
    setLoading(false)
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("radar")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blockers" },
        () => { fetchAll() }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blocker_metoo" },
        () => { fetchAll() }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAll])

  const post = useCallback(async (category: string, note: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase
      .from("blockers")
      .insert({ author_id: user.id, category, note })

    if (error) throw error
    // Realtime will trigger refetch
  }, [])

  const toggleMeToo = useCallback(async (blockerId: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const alreadyIn = mineMeToo.has(blockerId)

    if (alreadyIn) {
      const { error } = await supabase
        .from("blocker_metoo")
        .delete()
        .eq("blocker_id", blockerId)
        .eq("user_id", user.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from("blocker_metoo")
        .insert({ blocker_id: blockerId, user_id: user.id })
      if (error) throw error
    }
    // Realtime will trigger refetch
  }, [mineMeToo])

  return { blockers, loading, post, toggleMeToo, meTooCounts, mineMeToo, userId }
}
