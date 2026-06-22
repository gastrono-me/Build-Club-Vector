import type { Session, Day, Venue } from '@/types/index'
import { SESSIONS } from './sessions'
import { DAYS } from './days'
import { VENUES } from './venues'

export interface EventData {
  sessions: Session[]
  days: Day[]
  venues: Record<string, Venue>
}

/**
 * Returns mock event data synchronously.
 * This is the single swap-point for future live Luma data.
 */
export function useEventData(): EventData {
  return {
    sessions: SESSIONS,
    days: DAYS,
    venues: VENUES,
  }
}
