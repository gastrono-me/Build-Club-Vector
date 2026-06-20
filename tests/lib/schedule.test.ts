import { describe, it, expect } from 'vitest'
import { overlaps, conflictIds } from '@/lib/schedule'

describe('schedule', () => {
  const a = { id: 's1', day: 0, start: 540, end: 600 }  // 9:00-10:00 day 0
  const b = { id: 's2', day: 0, start: 570, end: 660 }  // 9:30-11:00 day 0 — overlaps a
  const c = { id: 's3', day: 0, start: 600, end: 660 }  // 10:00-11:00 day 0 — adjacent to a (end==start), but overlaps b!
  // For conflict-set tests we need a session that is adjacent to a and doesn't overlap b:
  const e = { id: 's5', day: 0, start: 660, end: 720 }  // 11:00-12:00 day 0 — after b ends, no overlap with either
  const d = { id: 's4', day: 1, start: 540, end: 600 }  // 9:00-10:00 day 1 — different day

  it('overlaps returns true for same-day overlapping sessions', () => {
    expect(overlaps(a, b)).toBe(true)
  })

  it('overlaps returns false for adjacent sessions (end==start)', () => {
    expect(overlaps(a, c)).toBe(false)
  })

  it('overlaps returns false for different days', () => {
    expect(overlaps(a, d)).toBe(false)
  })

  it('conflictIds returns ids of sessions in conflict', () => {
    const ids = conflictIds([a, b, e, d])
    expect(ids.has('s1')).toBe(true)
    expect(ids.has('s2')).toBe(true)
    expect(ids.has('s5')).toBe(false)
    expect(ids.has('s4')).toBe(false)
  })

  it('conflictIds returns empty set when no conflicts', () => {
    const ids = conflictIds([a, e, d])
    expect(ids.size).toBe(0)
  })
})
