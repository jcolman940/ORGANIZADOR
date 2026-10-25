import { useState } from 'react'
import { fromKey } from '@shared/dates'
import type { CalendarEvent, EventType } from '@shared/types'
import { EventChip } from './EventChip'
import { Modal } from './Modal'

export const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'parcial', label: 'Parcial' },
  { value: 'entrega', label: 'Entrega' },
  { value: 'recordatorio', label: 'Recordatorio' }
]

export function formatDay(key: string): string {
  return fromKey(key).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** Formulario para crear (event.id vacío) o editar un evento. */
export function EventForm({
  event,
  onSave,
  onDelete,
  onClose
}: {
  event: CalendarEvent
  onSave: (e: CalendarEvent) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(event.title)
  const [type, setType] = useState<EventType>(event.type)
  const [time, setTime] = useState(event.time ?? '')
  const [error, setError] = useState('')

  return (
    <form
      className="form"
      onSubmit={e => {
        e.preventDefault()
        if (!title.trim()) return setError('Escribí un título')
        onSave({ ...event, title: title.trim(), type, time: time || undefined })
      }}
    >
      <label>
        Título
        <input
          autoFocus
          value={title}
          onChange={e => {
            setTitle(e.target.value)
            setError('')
          }}
        />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <label>
        Tipo
        <select value={type} onChange={e => setType(e.target.value as EventType)}>
          {EVENT_TYPES.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Hora (opcional)
        <input type="time" value={time} onChange={e => setTime(e.target.value)} />
      </label>
      <div className="form-actions">
        {onDelete ? (
          <button type="button" className="btn btn-danger spacer" onClick={onDelete}>
            Eliminar
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
  )
}

export function EventDialog({
  event,
  onSave,
  onDelete,
  onClose
}: {
  event: CalendarEvent
  onSave: (e: CalendarEvent) => void
  onDelete?: () => void
  onClose: () => void
}) {
  return (
    <Modal title={`${event.id ? 'Editar evento' : 'Nuevo evento'} · ${formatDay(event.date)}`} onClose={onClose}>
      <EventForm event={event} onSave={onSave} onDelete={onDelete} onClose={onClose} />
    </Modal>
  )
}

/** Lista completa de un día, para cuando no entran todos los eventos en la celda. */
export function DayDialog({
  dayKey,
  events,
  onPick,
  onNew,
  onClose
}: {
  dayKey: string
  events: CalendarEvent[]
  onPick: (e: CalendarEvent) => void
  onNew: () => void
  onClose: () => void
}) {
  return (
    <Modal title={formatDay(dayKey)} onClose={onClose}>
      <div className="day-list">
        {events.map(e => (
          <EventChip key={e.id} event={e} onClick={() => onPick(e)} />
        ))}
      </div>
      <div className="form-actions">
        <button className="btn" onClick={onClose}>
          Cerrar
        </button>
        <button className="btn btn-primary" onClick={onNew}>
          Nuevo evento
        </button>
      </div>
    </Modal>
  )
}
