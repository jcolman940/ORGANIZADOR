import { expect, test } from 'vitest'
import { isDueOn, WEEKDAYS_ALL, WEEKDAYS_WORK } from '@shared/recurrence'

test('lunes a viernes', () => {
  expect(isDueOn({ kind: 'weekdays', days: WEEKDAYS_WORK }, '2026-10-23')).toBe(true)
  expect(isDueOn({ kind: 'weekdays', days: WEEKDAYS_WORK }, '2026-10-24')).toBe(false)
})

test('todos los días incluye el domingo', () => {
  expect(isDueOn({ kind: 'weekdays', days: WEEKDAYS_ALL }, '2026-10-25')).toBe(true)
})

test('solo martes', () => {
  expect(isDueOn({ kind: 'weekdays', days: [1] }, '2026-10-27')).toBe(true)
  expect(isDueOn({ kind: 'weekdays', days: [1] }, '2026-10-28')).toBe(false)
})

test('fecha específica', () => {
  expect(isDueOn({ kind: 'date', date: '2026-11-03' }, '2026-11-03')).toBe(true)
  expect(isDueOn({ kind: 'date', date: '2026-11-03' }, '2026-11-10')).toBe(false)
})

test('recurrenceLabel', async () => {
  const { recurrenceLabel } = await import('@shared/recurrence')
  expect(recurrenceLabel({ kind: 'weekdays', days: WEEKDAYS_ALL })).toBe('Todos los días')
  expect(recurrenceLabel({ kind: 'weekdays', days: [4, 0, 1, 2, 3] })).toBe('Lun a Vie')
  expect(recurrenceLabel({ kind: 'weekdays', days: [1, 3] })).toBe('Mar, Jue')
  expect(recurrenceLabel({ kind: 'date', date: '2026-11-03' })).toBe('3/11/2026')
})
