"use client"

import React, { createContext, useContext, useState } from "react"
import { useCatchups, type CatchupAgendaRow } from "@/lib/hooks/useCatchups"
import { useInbox, type InboxConversation } from "@/lib/hooks/useInbox"
import { PersonPanel } from "@/components/people/PersonPanel"

export type { InboxConversation }

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
  catchups: CatchupAgendaRow[]
  cancelCatchup: (catchupId: string) => void
  openPanel: (p: ChatPerson, focus: "chat" | "catchup") => void
  inbox: InboxConversation[]
  totalUnread: number
  markRead: (otherId: string) => void
}

const SocialContext = createContext<SocialApi | null>(null)

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { catchups, cancel: cancelCatchup } = useCatchups()
  const { conversations: inbox, totalUnread, markRead } = useInbox()
  const [panelPerson, setPanelPerson] = useState<ChatPerson | null>(null)
  const [panelFocus, setPanelFocus] = useState<"chat" | "catchup">("chat")

  const api: SocialApi = {
    catchups,
    cancelCatchup,
    openPanel: (p, focus) => {
      if (focus === "chat") markRead(p.id)
      setPanelPerson(p)
      setPanelFocus(focus)
    },
    inbox,
    totalUnread,
    markRead,
  }

  return (
    <SocialContext.Provider value={api}>
      {children}
      {panelPerson && (
        <PersonPanel
          person={panelPerson}
          focus={panelFocus}
          onClose={() => setPanelPerson(null)}
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
