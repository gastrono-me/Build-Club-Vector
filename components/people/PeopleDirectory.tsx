"use client"

import React, { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useProfile } from "@/lib/hooks/useProfile"
import { useEventData } from "@/lib/data/useEventData"
import { keywordSearch } from "@/lib/search"
import { Input } from "@/components/ui/Input"
import { Tag } from "@/components/ui/Tag"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { PersonCard, type NormalizedPerson } from "@/components/people/PersonCard"
import type { Profile } from "@/types/index"
import { ALL_TAGS, INDUSTRIES, LOOKING } from "@/types/index"
import { colors, fonts, fontSize, spacing } from "@/lib/design/tokens"

export function PeopleDirectory() {
  const { profile } = useProfile()
  const { attendees } = useEventData()

  const [realProfiles, setRealProfiles] = useState<NormalizedPerson[]>([])
  const [signedInId, setSignedInId] = useState<string | null>(null)
  const [loadingProfiles, setLoadingProfiles] = useState(true)

  const [query, setQuery] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedLooking, setSelectedLooking] = useState<string[]>([])

  useEffect(() => {
    async function fetchProfiles() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setSignedInId(user?.id ?? null)

      const { data } = await supabase.from("profiles").select("*")
      if (data) {
        const normalized: NormalizedPerson[] = (data as (Profile & { id: string })[])
          .map(row => ({
            id: row.id,
            name: row.name ?? "",
            occupation: row.org
              ? `${row.occupation ?? ""}${row.occupation && row.org ? " · " : ""}${row.org}`
              : (row.occupation ?? ""),
            tags: row.skills ?? [],
            industries: row.industries ?? [],
            looking: row.looking ?? [],
            bio: row.bio ?? "",
            tagline: row.tagline,
            links: row.links,
            avatar: row.avatar_url ?? null,
            isReal: true,
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
        setRealProfiles(normalized)
      }
      setLoadingProfiles(false)
    }

    fetchProfiles()
  }, [])

  // Normalize mock attendees
  const mockPeople: NormalizedPerson[] = attendees
    .map(a => ({
      id: a.id,
      name: a.name,
      occupation: a.org ? `${a.role}${a.role && a.org ? " · " : ""}${a.org}` : a.role,
      tags: a.tags,
      industries: a.industries,
      looking: a.looking,
      bio: a.bio,
      tagline: undefined,
      links: undefined,
      handle: a.handle,
      avatar: null,
      isReal: false,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Merge: real first, mock second; exclude signed-in user
  const allPeople: NormalizedPerson[] = [
    ...realProfiles.filter(p => p.id !== signedInId),
    ...mockPeople,
  ]

  // Apply keyword search (NormalizedPerson lacks an index signature required by SearchablePerson,
  // so we cast through unknown on the input and output)
  const afterKeyword = keywordSearch(
    allPeople as unknown as Parameters<typeof keywordSearch>[0],
    query,
  ) as unknown as NormalizedPerson[]

  // Apply chip filters
  const filtered = afterKeyword.filter(person => {
    const skillsOk =
      selectedSkills.length === 0 ||
      selectedSkills.some(s => person.tags.includes(s))
    const industriesOk =
      selectedIndustries.length === 0 ||
      selectedIndustries.some(i => person.industries.includes(i))
    const lookingOk =
      selectedLooking.length === 0 ||
      selectedLooking.some(l => person.looking.includes(l))
    return skillsOk && industriesOk && lookingOk
  })

  function toggleSkill(tag: string) {
    setSelectedSkills(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }
  function toggleIndustry(ind: string) {
    setSelectedIndustries(prev =>
      prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
    )
  }
  function toggleLooking(l: string) {
    setSelectedLooking(prev =>
      prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]
    )
  }

  return (
    <div>
      <SectionTitle
        kicker={`${filtered.length} ${filtered.length === 1 ? "person" : "people"}`}
        title="Find your people"
        note="Browse and filter by skills, industries, and what people are looking for."
      />

      {/* Keyword search */}
      <div style={{ marginBottom: spacing[5] }}>
        <Input
          placeholder="Search by name, role, org, or bio…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          icon={<Search size={15} />}
        />
      </div>

      {/* Filter rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: spacing[4], marginBottom: spacing[6] }}>
        {/* Skills */}
        <div>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: fontSize.label,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              color: colors.muted,
              marginBottom: spacing[2],
            }}
          >
            Skills
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: spacing[2] }}>
            {ALL_TAGS.map(tag => (
              <Tag
                key={tag}
                active={selectedSkills.includes(tag)}
                onClick={() => toggleSkill(tag)}
              >
                {tag}
              </Tag>
            ))}
          </div>
        </div>

        {/* Industries */}
        <div>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: fontSize.label,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              color: colors.muted,
              marginBottom: spacing[2],
            }}
          >
            Industries
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: spacing[2] }}>
            {INDUSTRIES.map(ind => (
              <Tag
                key={ind}
                active={selectedIndustries.includes(ind)}
                onClick={() => toggleIndustry(ind)}
              >
                {ind}
              </Tag>
            ))}
          </div>
        </div>

        {/* Looking for */}
        <div>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: fontSize.label,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              color: colors.muted,
              marginBottom: spacing[2],
            }}
          >
            Looking for
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: spacing[2] }}>
            {LOOKING.map(l => (
              <Tag
                key={l}
                active={selectedLooking.includes(l)}
                onClick={() => toggleLooking(l)}
              >
                {l}
              </Tag>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loadingProfiles && (
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: fontSize.meta,
            color: colors.mutedSoft,
            marginBottom: spacing[4],
          }}
        >
          Loading profiles…
        </div>
      )}

      {/* People grid */}
      {filtered.length === 0 && !loadingProfiles ? (
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: fontSize.body,
            color: colors.muted,
            padding: `${spacing[8]}px 0`,
            textAlign: "center" as const,
          }}
        >
          No people match your filters.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: spacing[4],
          }}
        >
          {filtered.map(person => (
            <PersonCard key={person.id} person={person} me={profile} />
          ))}
        </div>
      )}
    </div>
  )
}

export default PeopleDirectory
