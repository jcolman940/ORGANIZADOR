import { useState } from 'react'
import { progress, toggleStep } from '@shared/ops'
import { recurrenceLabel } from '@shared/recurrence'
import type { AppData, Task } from '@shared/types'
import type { Update } from '../state/useAppData'
import { CopyBlock } from './CopyBlock'

export function TaskCard({
  task,
  data,
  update,
  today,
  dueToday,
  showRecurrence,
  onEdit
}: {
  task: Task
  data: AppData
  update: Update
  today: string
  dueToday: boolean
  showRecurrence: boolean
  onEdit: () => void
}) {
  const [open, setOpen] = useState(false)
  const checked = data.checks[today]?.[task.id] ?? []
  const p = progress(data, today, task)
  const complete = p.total > 0 && p.done === p.total

  return (
    <article className={`card task ${dueToday ? '' : 'not-due'}`}>
      <div className="task-head">
        <button className="task-toggle" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          <span className="chevron" aria-hidden="true">
            {open ? '▾' : '▸'}
          </span>
          <span className="task-name">{task.name}</span>
        </button>
        {showRecurrence ? <span className="task-recurrence">{recurrenceLabel(task.recurrence)}</span> : null}
        {dueToday ? (
          <span className={`task-progress ${complete ? 'complete' : ''}`}>
            {p.done} de {p.total}
          </span>
        ) : null}
        <button className="icon-btn" aria-label="Editar tarea" onClick={onEdit}>
          ✎
        </button>
      </div>
      {open ? (
        <ol className="steps">
          {task.steps.length === 0 ? <li className="step empty">Esta tarea no tiene pasos todavía.</li> : null}
          {task.steps.map(s => {
            const done = checked.includes(s.id)
            return (
              <li key={s.id} className={`step ${done ? 'done' : ''}`}>
                {dueToday ? (
                  <label className="step-label">
                    <input type="checkbox" checked={done} onChange={() => update(d => toggleStep(d, today, task.id, s.id))} />
                    <span>{s.text}</span>
                  </label>
                ) : (
                  <span className="step-label">{s.text}</span>
                )}
                {s.command ? <CopyBlock text={s.command} /> : null}
              </li>
            )
          })}
        </ol>
      ) : null}
    </article>
  )
}
