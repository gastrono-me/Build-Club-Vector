export interface ScheduleItem {
  id: string
  day: number
  start: number
  end: number
}

/**
 * Returns true if two items share the same day and their time windows overlap
 * (half-open intervals: a.start < b.end && b.start < a.end).
 * Adjacent sessions where end === start do NOT overlap.
 */
export function overlaps(a: ScheduleItem, b: ScheduleItem): boolean {
  return a.day === b.day && a.start < b.end && b.start < a.end
}

/**
 * O(n²) scan — returns the Set of item ids involved in at least one conflict.
 */
export function conflictIds(items: ScheduleItem[]): Set<string> {
  const conflicts = new Set<string>()
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (overlaps(items[i], items[j])) {
        conflicts.add(items[i].id)
        conflicts.add(items[j].id)
      }
    }
  }
  return conflicts
}
