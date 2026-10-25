import { fromKey, weekdayMon0 } from './dates'
import type { Recurrence } from './types'

export const WEEKDAYS_ALL = [0, 1, 2, 3, 4, 5, 6]
export const WEEKDAYS_WORK = [0, 1, 2, 3, 4]

export function isDueOn(r: Recurrence, key: string): boolean {
  if (r.kind === 'date') return r.date === key
  return r.days.includes(weekdayMon0(fromKey(key)))
}
