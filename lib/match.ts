export const LOOKING_PAIRS: Record<string, string[]> = {
  Teammate: ['Teammate', 'Co-founder'],
  'Co-founder': ['Co-founder', 'Teammate'],
  Mentor: ['Mentee'],
  Mentee: ['Mentor'],
  'Just networking': ['Just networking', 'Teammate'],
}

export interface MatchResult {
  score: number
  shared: string[]
  sharedIndustries: string[]
}

export interface PersonLike {
  tags?: string[]
  industries?: string[]
  looking?: string[]
}

/**
 * Compute tag-overlap badges and a combined score between two profiles.
 * Returns {score, shared, sharedIndustries}.
 * Used for badge display only — not search ranking.
 */
export function matchScore(me: PersonLike | null | undefined, person: PersonLike): MatchResult {
  if (!me) return { score: 0, shared: [], sharedIndustries: [] }
  const mine = new Set(me.tags ?? [])
  const shared = (person.tags ?? []).filter((t) => mine.has(t))
  const myInd = new Set(me.industries ?? [])
  const sharedIndustries = (person.industries ?? []).filter((i) => myInd.has(i))
  let score = shared.length * 10 + sharedIndustries.length * 4
  const myLooking = me.looking ?? []
  const theirLooking = person.looking ?? []
  const lookingMatch = myLooking.some((l) =>
    (LOOKING_PAIRS[l] ?? []).some((x) => theirLooking.includes(x))
  )
  if (lookingMatch) score += 8
  return { score, shared, sharedIndustries }
}
