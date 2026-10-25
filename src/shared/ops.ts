import { isDueOn } from './recurrence'
import type { AppData, BoardCard, CalendarEvent, Column, Task } from './types'

// Funciones puras: nunca mutan `d`, siempre devuelven un AppData nuevo.

export function newId(): string {
  return crypto.randomUUID()
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some(x => x.id === item.id) ? list.map(x => (x.id === item.id ? item : x)) : [...list, item]
}

export function upsertEvent(d: AppData, e: CalendarEvent): AppData {
  return { ...d, events: upsert(d.events, e) }
}

export function deleteEvent(d: AppData, id: string): AppData {
  return { ...d, events: d.events.filter(e => e.id !== id) }
}

export function eventsOn(d: AppData, key: string): CalendarEvent[] {
  return d.events
    .filter(e => e.date === key)
    .sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'))
}

export function upsertTask(d: AppData, t: Task): AppData {
  return { ...d, tasks: upsert(d.tasks, t) }
}

export function deleteTask(d: AppData, id: string): AppData {
  const checks: AppData['checks'] = {}
  for (const [key, byTask] of Object.entries(d.checks)) {
    const { [id]: _removed, ...rest } = byTask
    checks[key] = rest
  }
  return { ...d, tasks: d.tasks.filter(t => t.id !== id), checks }
}

export function tasksDueOn(d: AppData, key: string): Task[] {
  return d.tasks.filter(t => isDueOn(t.recurrence, key))
}

export function toggleStep(d: AppData, key: string, taskId: string, stepId: string): AppData {
  const day = d.checks[key] ?? {}
  const current = day[taskId] ?? []
  const next = current.includes(stepId) ? current.filter(s => s !== stepId) : [...current, stepId]
  return { ...d, checks: { ...d.checks, [key]: { ...day, [taskId]: next } } }
}

/** Cuenta solo pasos que todavía existen en la tarea. */
export function progress(d: AppData, key: string, task: Task): { done: number; total: number } {
  const checked = d.checks[key]?.[task.id] ?? []
  return { done: task.steps.filter(s => checked.includes(s.id)).length, total: task.steps.length }
}

export function upsertCard(d: AppData, c: BoardCard): AppData {
  return { ...d, board: upsert(d.board, c) }
}

export function deleteCard(d: AppData, id: string): AppData {
  return { ...d, board: d.board.filter(c => c.id !== id) }
}

/** Mueve la tarjeta al final de la columna destino. */
export function moveCard(d: AppData, id: string, column: Column): AppData {
  const card = d.board.find(c => c.id === id)
  if (!card) return d
  return { ...d, board: [...d.board.filter(c => c.id !== id), { ...card, column }] }
}
