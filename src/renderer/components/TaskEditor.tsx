import { useState } from 'react'
import { newId } from '@shared/ops'
import { WEEKDAYS_ALL, WEEKDAYS_WORK } from '@shared/recurrence'
import type { Step, Task } from '@shared/types'
import { Modal } from './Modal'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function TaskEditor({
  task,
  onSave,
  onDelete,
  onClose
}: {
  task: Task | null
  onSave: (t: Task) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState(task?.name ?? '')
  const [kind, setKind] = useState<'weekdays' | 'date'>(task?.recurrence.kind ?? 'weekdays')
  const [days, setDays] = useState<number[]>(task?.recurrence.kind === 'weekdays' ? task.recurrence.days : WEEKDAYS_WORK)
  const [date, setDate] = useState(task?.recurrence.kind === 'date' ? task.recurrence.date : '')
  const [steps, setSteps] = useState<Step[]>(task?.steps ?? [])
  const [error, setError] = useState('')

  const setStep = (i: number, patch: Partial<Step>) => setSteps(s => s.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const move = (i: number, delta: number) =>
    setSteps(s => {
      const j = i + delta
      if (j < 0 || j >= s.length) return s
      const next = [...s]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  const toggleDay = (d: number) => setDays(ds => (ds.includes(d) ? ds.filter(x => x !== d) : [...ds, d].sort()))

  const save = () => {
    if (!name.trim()) return setError('Escribí un nombre')
    if (kind === 'weekdays' && days.length === 0) return setError('Elegí al menos un día')
    if (kind === 'date' && !date) return setError('Elegí una fecha')
    onSave({
      id: task?.id ?? newId(),
      name: name.trim(),
      recurrence: kind === 'weekdays' ? { kind, days } : { kind, date },
      // El comando se guarda exacto; solo se descarta si está completamente vacío.
      steps: steps.filter(s => s.text.trim() || s.command).map(s => ({ ...s, text: s.text.trim(), command: s.command ? s.command : undefined }))
    })
  }

  return (
    <Modal title={task ? 'Editar tarea' : 'Nueva tarea'} onClose={onClose}>
      <form
        className="form task-editor"
        onSubmit={e => {
          e.preventDefault()
          save()
        }}
        onChange={() => setError('')}
      >
        <label>
          Nombre
          <input autoFocus value={name} onChange={e => setName(e.target.value)} />
        </label>

        <fieldset className="recurrence">
          <legend>Se repite</legend>
          <label className="inline">
            <input type="radio" name="kind" checked={kind === 'weekdays'} onChange={() => setKind('weekdays')} />
            Días de la semana
          </label>
          {kind === 'weekdays' ? (
            <div className="days-row">
              {DAYS.map((d, i) => (
                <label key={d} className="day-check">
                  <input type="checkbox" checked={days.includes(i)} onChange={() => toggleDay(i)} />
                  {d}
                </label>
              ))}
              <button type="button" className="btn" onClick={() => setDays(WEEKDAYS_ALL)}>
                Todos los días
              </button>
              <button type="button" className="btn" onClick={() => setDays(WEEKDAYS_WORK)}>
                Lun a Vie
              </button>
            </div>
          ) : null}
          <label className="inline">
            <input type="radio" name="kind" checked={kind === 'date'} onChange={() => setKind('date')} />
            Fecha específica
          </label>
          {kind === 'date' ? (
            <label>
              Fecha
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </label>
          ) : null}
        </fieldset>

        <fieldset className="steps-editor">
          <legend>Pasos</legend>
          {steps.map((s, i) => (
            <div key={s.id} className="step-edit">
              <span className="step-index">{i + 1}</span>
              <div className="step-fields">
                <label>
                  Texto
                  <input value={s.text} onChange={e => setStep(i, { text: e.target.value })} />
                </label>
                <label>
                  Comando (opcional)
                  <textarea
                    className="mono"
                    rows={2}
                    spellCheck={false}
                    value={s.command ?? ''}
                    onChange={e => setStep(i, { command: e.target.value })}
                  />
                </label>
              </div>
              <div className="step-buttons">
                <button type="button" className="icon-btn" aria-label="Subir" onClick={() => move(i, -1)}>
                  ↑
                </button>
                <button type="button" className="icon-btn" aria-label="Bajar" onClick={() => move(i, 1)}>
                  ↓
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Borrar paso"
                  onClick={() => setSteps(st => st.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="btn" onClick={() => setSteps(s => [...s, { id: newId(), text: '' }])}>
            Agregar paso
          </button>
        </fieldset>

        {error ? <p className="error">{error}</p> : null}
        <div className="form-actions">
          {task ? (
            <button
              type="button"
              className="btn btn-danger spacer"
              onClick={() => {
                if (window.confirm(`¿Eliminar la tarea "${task.name}"?`)) onDelete(task.id)
              }}
            >
              Eliminar tarea
            </button>
          ) : null}
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  )
}
