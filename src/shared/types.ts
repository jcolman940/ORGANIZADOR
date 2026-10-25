export type EventType = 'parcial' | 'entrega' | 'recordatorio'

/** date: 'YYYY-MM-DD', time: 'HH:MM' */
export interface CalendarEvent {
  id: string
  date: string
  title: string
  type: EventType
  time?: string
}

/** days: 0 = lunes … 6 = domingo */
export type Recurrence = { kind: 'weekdays'; days: number[] } | { kind: 'date'; date: string }

export interface Step {
  id: string
  text: string
  command?: string
}

export interface Task {
  id: string
  name: string
  recurrence: Recurrence
  steps: Step[]
}

export type Column = 'todo' | 'doing' | 'done'

export interface BoardCard {
  id: string
  title: string
  description?: string
  column: Column
}

export interface AppData {
  version: 1
  events: CalendarEvent[]
  tasks: Task[]
  /** checks[dateKey][taskId] = ids de pasos tildados ese día */
  checks: Record<string, Record<string, string[]>>
  board: BoardCard[]
}

export const emptyData: AppData = { version: 1, events: [], tasks: [], checks: {}, board: [] }
