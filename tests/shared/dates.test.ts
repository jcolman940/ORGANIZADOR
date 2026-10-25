import { describe, expect, test } from 'vitest'
import { dateKey, fromKey, monthGrid, msUntilNextMidnight, weekdayMon0 } from '@shared/dates'

describe('dateKey', () => {
  test('usa el día local aunque sea de noche', () => {
    expect(dateKey(new Date(2026, 9, 25, 22, 30))).toBe('2026-10-25')
    expect(dateKey(new Date(2026, 9, 25, 23, 59))).toBe('2026-10-25')
  })
  test('fromKey vuelve a la medianoche local', () => {
    const d = fromKey('2026-03-05')
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 2, 5, 0])
  })
})

test('weekdayMon0: 1/10/2026 es jueves', () => {
  expect(weekdayMon0(new Date(2026, 9, 1))).toBe(3)
})

describe('monthGrid', () => {
  test('octubre 2026 ocupa 5 semanas', () => {
    const g = monthGrid(2026, 9)
    expect(g).toHaveLength(35)
    expect(g[0]).toEqual({ key: '2026-09-28', day: 28, inMonth: false })
    expect(g[3]).toEqual({ key: '2026-10-01', day: 1, inMonth: true })
    expect(g[34]).toMatchObject({ key: '2026-11-01', inMonth: false })
  })
  test('noviembre 2026 empieza en domingo y necesita 6 semanas', () => {
    const g = monthGrid(2026, 10)
    expect(g).toHaveLength(42)
    expect(g[6].key).toBe('2026-11-01')
    expect(g.filter(c => c.inMonth)).toHaveLength(30)
  })
})

test('msUntilNextMidnight', () => {
  expect(msUntilNextMidnight(new Date(2026, 9, 25, 23, 59, 0))).toBe(60000)
})
