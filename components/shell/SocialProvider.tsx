"use client"

import React, { createContext, useContext, useState } from "react"
import { useConnections } from "@/lib/hooks/useConnections"
import { useCatchups, type CatchupRow } from "@/lib/hooks/useCatchups"
import { ChatModal } from "@/components/people/ChatModal"
import { ScheduleCatchupModal } from "@/components/people/ScheduleCatchupModal"

export interface ChatPerson {
  id: string
  name: string
  occupation?: string
  org?: string
  tags?: string[]
  industries?: string[]
  looking?: string[]
  bio?: string
  avatar?: string | null
}

interface SocialApi {
  connections: Set<string>
  toggleConnection: (personId: string) => void
  catchups: CatchupRow[]
  cancelCatchup: (catchupId: string) => void
  addCatchup: (personId: string, day: number, startMin: number, personName?: string) => void
  openChat: (p: ChatPerson) => void
  openCatchup: (p: ChatPerson) => void
}

const SocialContext = createContext<SocialApi | null>(null)

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { connections, toggle: toggleConnection } = useConnections()
  const { catchups, add: addCatchup, cancel: cancelCatchup } = useCatchups()
  const [chatPerson, setChatPerson] = useState<ChatPerson | null>(null)
  const [catchupPerson, setCatchupPerson] = useState<ChatPerson | null>(null)

  const api: SocialApi = {
    connections,
    toggleConnection,
    catchups,
    cancelCatchup,
    addCatchup,
    openChat: (p) => setChatPerson(p),
    openCatchup: (p) => setCatchupPerson(p),
  }

  return (
    <SocialContext.Provider value={api}>
      {children}
      {chatPerson && (
        <ChatModal
          person={chatPerson}
          onClose={() => setChatPerson(null)}
          onOpenSchedule={() => { setCatchupPerson(chatPerson); setChatPerson(null) }}
        />
      )}
      {catchupPerson && (
        <ScheduleCatchupModal
          person={catchupPerson}
          onClose={() => setCatchupPerson(null)}
        />
      )}
    </SocialContext.Provider>
  )
}

export function useSocial(): SocialApi {
  const ctx = useContext(SocialContext)
  if (!ctx) throw new Error("useSocial must be used within a SocialProvider")
  return ctx
}
