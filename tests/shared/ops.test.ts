import { expect, test } from 'vitest'
import { deleteTask, eventsOn, moveCard, progress, tasksDueOn, toggleStep, upsertTask } from '@shared/ops'
import { emptyData, type AppData, type Task } from '@shared/types'

const task: Task = {
  id: 't1',
  name: 'Precarga',
  recurrence: { kind: 'weekdays', days: [0, 1, 2, 3, 4] },
  steps: [
    { id: 'a', text: 'A' },
    { id: 'b', text: 'B' },
    { id: 'c', text: 'C' },
    { id: 'd', text: 'D' }
  ]
}
const withTask: AppData = { ...emptyData, tasks: [task] }
const DAY = '2026-10-23'

test('toggleStep dos veces deja el paso sin tildar', () => {
  const once = toggleStep(withTask, DAY, 't1', 'a')
  expect(once.checks[DAY].t1).toEqual(['a'])
  expect(toggleStep(once, DAY, 't1', 'a').checks[DAY].t1).toEqual([])
})

test('toggleStep no muta la entrada', () => {
  toggleStep(withTask, DAY, 't1', 'a')
  expect(withTask.checks).toEqual({})
})

test('progress con 4 pasos y 1 tildado', () => {
  expect(progress(toggleStep(withTask, DAY, 't1', 'a'), DAY, task)).toEqual({ done: 1, total: 4 })
})

test('progress ignora pasos borrados', () => {
  let d = toggleStep(withTask, DAY, 't1', 'a')
  d = toggleStep(d, DAY, 't1', 'b')
  const edited: Task = { ...task, steps: [{ id: 'a', text: 'A' }] }
  d = upsertTask(d, edited)
  expect(progress(d, DAY, edited)).toEqual({ done: 1, total: 1 })
})

test('el progreso es por día', () => {
  const d = toggleStep(withTask, '2026-10-24', 't1', 'a')
  expect(progress(d, '2026-10-25', task).done).toBe(0)
})

test('tasksDueOn: el domingo solo aparece la de fecha', () => {
  const dated: Task = { id: 't2', name: 'Única', recurrence: { kind: 'date', date: '2026-10-25' }, steps: [] }
  const d = { ...withTask, tasks: [task, dated] }
  expect(tasksDueOn(d, '2026-10-25').map(t => t.id)).toEqual(['t2'])
})

test('moveCard cambia la columna y la deja al final', () => {
  const d: AppData = {
    ...emptyData,
    board: [
      { id: 'A', title: 'A', column: 'todo' },
      { id: 'B', title: 'B', column: 'todo' }
    ]
  }
  const moved = moveCard(d, 'A', 'doing')
  expect(moved.board.find(c => c.id === 'A')?.column).toBe('doing')
  expect(moved.board.map(c => c.id)).toEqual(['B', 'A'])
})

test('deleteTask también borra sus checks', () => {
  const d = deleteTask(toggleStep(withTask, DAY, 't1', 'a'), 't1')
  expect(d.tasks).toEqual([])
  expect(d.checks[DAY].t1).toBeUndefined()
})

test('eventsOn ordena por hora y deja los sin hora al final', () => {
  const d: AppData = {
    ...emptyData,
    events: [
      { id: '1', date: DAY, title: 'tarde', type: 'entrega', time: '14:00' },
      { id: '2', date: DAY, title: 'sin hora', type: 'recordatorio' },
      { id: '3', date: DAY, title: 'mañana', type: 'parcial', time: '09:00' },
      { id: '4', date: '2026-10-24', title: 'otro día', type: 'parcial' }
    ]
  }
  expect(eventsOn(d, DAY).map(e => e.title)).toEqual(['mañana', 'tarde', 'sin hora'])
})
