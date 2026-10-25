import { fromKey, weekdayMon0 } from './dates'
import type { Recurrence } from './types'

export const WEEKDAYS_ALL = [0, 1, 2, 3, 4, 5, 6]
export const WEEKDAYS_WORK = [0, 1, 2, 3, 4]

export function isDueOn(r: Recurrence, key: string): boolean {
  if (r.kind === 'date') return r.date === key
  return r.days.includes(weekdayMon0(fromKey(key)))
}

const SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function recurrenceLabel(r: Recurrence): string {
  if (r.kind === 'date') {
    const [y, m, d] = r.date.split('-').map(Number)
    return `${d}/${m}/${y}`
  }
  const days = [...r.days].sort()
  if (days.length === 7) return 'Todos los días'
  if (days.join() === WEEKDAYS_WORK.join()) return 'Lun a Vie'
  return days.map(d => SHORT[d]).join(', ')
}
