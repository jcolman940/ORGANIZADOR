import { useState } from 'react'
import { tasksDueOn } from '@shared/ops'
import { isDueOn } from '@shared/recurrence'
import type { AppData } from '@shared/types'
import { TaskCard } from '../components/TaskCard'
import type { Update } from '../state/useAppData'

export function TasksView({
  data,
  update,
  today,
  onEdit
}: {
  data: AppData
  update: Update
  today: string
  onEdit: (taskId: string | null) => void
}) {
  const [filter, setFilter] = useState<'today' | 'all'>('today')
  const tasks = filter === 'today' ? tasksDueOn(data, today) : data.tasks

  return (
    <>
      <header className="month-header">
        <h1 className="view-title">Tareas</h1>
        <div className="tasks-actions">
          <div className="segmented" role="group" aria-label="Filtro">
            <button aria-pressed={filter === 'today'} onClick={() => setFilter('today')}>
              Hoy
            </button>
            <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
              Todas
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => onEdit(null)}>
            Nueva tarea
          </button>
        </div>
      </header>

      {tasks.length === 0 ? (
        <p className="empty-state">{filter === 'today' ? 'No hay tareas para hoy' : 'Todavía no creaste tareas'}</p>
      ) : (
        <div className="task-list">
          {tasks.map(t => (
            <TaskCard
              key={t.id}
              task={t}
              data={data}
              update={update}
              today={today}
              dueToday={isDueOn(t.recurrence, today)}
              showRecurrence={filter === 'all'}
              onEdit={() => onEdit(t.id)}
            />
          ))}
        </div>
      )}
    </>
  )
}
