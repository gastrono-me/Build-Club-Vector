"use client"

import { useEffect, useRef, useState } from "react"
import { X, Send, CalendarDays, Loader2 } from "lucide-react"
import { Avatar } from "@/components/shell/Avatar"
import { useChat } from "@/lib/hooks/useChat"
import { useProfile } from "@/lib/hooks/useProfile"
import { localChatReply, openingLine } from "@/lib/ai/local-fallbacks"
import type { ChatPerson } from "@/components/shell/SocialProvider"
import { colors, radii, fonts, fontSize, fontWeight } from "@/lib/design/tokens"

export function ChatModal({
  person, onClose, onOpenSchedule,
}: { person: ChatPerson; onClose: () => void; onOpenSchedule: () => void }) {
  const { thread, append, loading, loaded } = useChat(person.id)
  const { profile } = useProfile()
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const seeded = useRef(false)
  const endRef = useRef<HTMLDivElement>(null)

  // Seed an opening line exactly once after the first successful load.
  useEffect(() => {
    if (!loaded || seeded.current) return
    seeded.current = true
    if (thread.length === 0) append({ sender: "them", body: openingLine(person) })
  }, [loaded, thread.length, person, append])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [thread, busy])

  async function submit() {
    const v = input.trim()
    if (!v || busy) return
    setInput("")
    await append({ sender: "me", body: v })
    setBusy(true)
    const me = profile
      ? { tags: profile.skills, industries: profile.industries, looking: profile.looking }
      : { tags: [], industries: [], looking: [] }
    const reply = localChatReply(me, person, v)
    await append({ sender: "them", body: reply })
    setBusy(false)
  }

  const firstName = person.name.split(" ")[0]

  return (
    <div onClick={onClose} role="presentation"
      style={{ position: "fixed", inset: 0, background: "rgba(20,20,60,0.45)", backdropFilter: "blur(2px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div role="dialog" aria-modal="true" aria-label={`Chat with ${person.name}`} onClick={e => e.stopPropagation()}
        style={{ background: colors.surface, border: `1.5px solid ${colors.ink}`, borderRadius: radii["2xl"], width: "100%", maxWidth: 420, height: "min(560px, 82vh)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1.5px solid ${colors.ink}`, background: colors.panel, flexShrink: 0 }}>
          <Avatar name={person.name} photo={person.avatar} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: fonts.display, fontWeight: fontWeight.semibold, fontSize: fontSize.heading, color: colors.ink }}>{person.name}</div>
            {(person.occupation || person.org) && (
              <div style={{ fontSize: fontSize.meta, color: colors.muted }}>{[person.occupation, person.org].filter(Boolean).join(" · ")}</div>
            )}
          </div>
          <button onClick={onOpenSchedule} title="Schedule a catchup" aria-label="Schedule a catchup"
            style={{ border: `1.4px solid ${colors.line}`, background: colors.surface, borderRadius: radii.sm, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: colors.ink, flexShrink: 0 }}>
            <CalendarDays size={16} />
          </button>
          <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "transparent", cursor: "pointer", color: colors.muted, flexShrink: 0 }}><X size={19} /></button>
        </div>
        {/* messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {thread.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.sender === "me" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "78%", padding: "9px 13px", borderRadius: 13, fontSize: fontSize.body, lineHeight: 1.45, background: m.sender === "me" ? colors.violet : colors.surface, color: m.sender === "me" ? colors.onDark : colors.ink, border: m.sender === "me" ? "none" : `1.4px solid ${colors.line}` }}>{m.body}</div>
            </div>
          ))}
          {busy && (
            <div style={{ display: "flex", gap: 6, alignItems: "center", color: colors.muted, fontSize: fontSize.meta }}>
              <Loader2 size={13} className="vec-spin" /> {firstName} is typing
            </div>
          )}
          <div ref={endRef} />
        </div>
        {/* input */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: 12, borderTop: `1.4px solid ${colors.line}`, background: colors.panel, flexShrink: 0 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submit() }}
            placeholder={`Message ${firstName}`}
            style={{ flex: 1, border: `1.4px solid ${colors.line}`, borderRadius: radii.md, padding: "9px 12px", fontSize: fontSize.body, outline: "none", background: colors.surface, color: colors.ink }} />
          <button onClick={submit} disabled={busy || !input.trim()}
            style={{ width: 36, height: 36, borderRadius: radii.md, border: "none", cursor: input.trim() ? "pointer" : "not-allowed", background: input.trim() ? colors.violet : colors.line, color: colors.onDark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatModal
