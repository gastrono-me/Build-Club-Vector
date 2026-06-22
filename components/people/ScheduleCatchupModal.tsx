"use client"

import { useMemo, useState } from "react"
import { X, AlertTriangle, Check } from "lucide-react"
import { Avatar } from "@/components/shell/Avatar"
import { Tag } from "@/components/ui/Tag"
import { Button } from "@/components/ui/Button"
import { useSocial, type ChatPerson } from "@/components/shell/SocialProvider"
import { useSavedSchedule } from "@/lib/hooks/useSavedSchedule"
import { useEventData } from "@/lib/data/useEventData"
import { buildAgenda, overlaps, type AgendaItem } from "@/lib/schedule"
import { hm, fmt } from "@/lib/time"
import { colors, radii, fonts, fontSize, fontWeight } from "@/lib/design/tokens"

// colors.oxbloodSoft does not exist in the token file; substitute colors.liveSoft
// which is the soft variant of the same oxblood/live hue (#8A2233 → #F5E0E3).
const oxbloodSoft = colors.liveSoft

export function ScheduleCatchupModal({ person, onClose }: { person: ChatPerson; onClose: () => void }) {
  const { catchups, addCatchup, cancelCatchup } = useSocial()
  const { saved } = useSavedSchedule()
  const { sessions, days, attendees } = useEventData()

  const existing = catchups.find(c => c.person_id === person.id)
  const [day, setDay] = useState<number>(existing?.day ?? 1)
  const [start, setStart] = useState<number>(existing?.start_min ?? hm(11, 0))

  const TIMES = useMemo(() => {
    const arr: number[] = []
    for (let m = hm(8, 0); m <= hm(22, 45); m += 15) arr.push(m)
    return arr
  }, [])

  const nameFor = (id: string) => attendees.find(a => a.id === id)?.name ?? "someone"
  const savedItems: AgendaItem[] = sessions
    .filter(s => saved.has(s.id))
    .map(s => ({ id: s.id, day: s.day, start: s.start, end: s.end, title: s.title, kind: "session" as const }))
  const end = start + 15
  const agenda = buildAgenda(savedItems, catchups, nameFor, existing?.id).filter(it => it.day === day)
  const candidate = { id: "candidate", day, start, end }
  const conflicts = agenda.filter(it => overlaps(candidate, it))

  return (
    <div onClick={onClose} role="presentation"
      style={{ position: "fixed", inset: 0, background: "rgba(20,20,60,0.45)", backdropFilter: "blur(2px)", zIndex: 51, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div role="dialog" aria-modal="true" aria-label={`Schedule a catchup with ${person.name}`} onClick={e => e.stopPropagation()}
        style={{ background: colors.surface, border: `1.5px solid ${colors.ink}`, borderRadius: radii["2xl"], padding: 26, maxWidth: 420, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Avatar name={person.name} photo={person.avatar} size={36} />
            <div>
              <div style={{ fontFamily: fonts.mono, fontSize: fontSize.label, color: colors.violet, letterSpacing: "0.08em" }}>15-MIN CATCHUP</div>
              <div style={{ fontFamily: fonts.display, fontWeight: fontWeight.bold, fontSize: 17, color: colors.ink }}>{person.name}</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "transparent", cursor: "pointer", color: colors.muted }}><X size={19} /></button>
        </div>

        <div style={{ fontFamily: fonts.mono, fontSize: fontSize.label, color: colors.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "18px 0 6px" }}>Day</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {days.map(d => <Tag key={d.idx} active={day === d.idx} onClick={() => setDay(d.idx)}>{d.date}</Tag>)}
        </div>

        <div style={{ fontFamily: fonts.mono, fontSize: fontSize.label, color: colors.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "16px 0 6px" }}>Time</div>
        <select value={start} onChange={e => setStart(+e.target.value)}
          style={{ width: "100%", border: `1.4px solid ${colors.line}`, borderRadius: radii.md, padding: "10px 12px", fontSize: fontSize.body, background: colors.surface, color: colors.ink, outline: "none" }}>
          {TIMES.map(m => <option key={m} value={m}>{fmt(m)} {"–"} {fmt(m + 15)}</option>)}
        </select>

        <div style={{ marginTop: 16, borderRadius: radii.lg, padding: "12px 14px", fontSize: fontSize.meta, lineHeight: 1.5, background: conflicts.length ? oxbloodSoft : colors.goSoft, color: conflicts.length ? colors.oxblood : colors.go, display: "flex", gap: 9 }}>
          {conflicts.length ? <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> : <Check size={16} style={{ flexShrink: 0, marginTop: 1 }} />}
          <div>
            {conflicts.length
              ? `Overlaps with ${conflicts.map(c => `"${c.title}" (${fmt(c.start)}-${fmt(c.end)})`).join(" and ")}.`
              : "This slot is free on your schedule."}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          {existing && (
            <Button variant="danger" full onClick={() => { cancelCatchup(existing.id); onClose() }}>Cancel catchup</Button>
          )}
          <Button variant="primary" full onClick={() => { addCatchup(person.id, day, start); onClose() }}>
            {conflicts.length ? "Schedule anyway" : existing ? "Save changes" : "Schedule catchup"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ScheduleCatchupModal
