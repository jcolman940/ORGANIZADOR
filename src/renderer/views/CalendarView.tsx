import { useState } from 'react'
import { fromKey, monthGrid } from '@shared/dates'
import { deleteEvent, eventsOn, newId, upsertEvent } from '@shared/ops'
import type { AppData, CalendarEvent } from '@shared/types'
import { EventChip } from '../components/EventChip'
import { DayDialog, EventDialog } from '../components/EventDialog'
import type { Update } from '../state/useAppData'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MAX_VISIBLE = 3

type Open = { kind: 'event'; event: CalendarEvent } | { kind: 'day'; key: string } | null

export function CalendarView({ data, update, today }: { data: AppData; update: Update; today: string }) {
  const t = fromKey(today)
  const [month, setMonth] = useState({ year: t.getFullYear(), month0: t.getMonth() })
  const [open, setOpen] = useState<Open>(null)

  const shift = (delta: number) =>
    setMonth(m => {
      const d = new Date(m.year, m.month0 + delta, 1)
      return { year: d.getFullYear(), month0: d.getMonth() }
    })

  const newEvent = (key: string) => setOpen({ kind: 'event', event: { id: '', date: key, title: '', type: 'parcial' } })
  const cells = monthGrid(month.year, month.month0)

  return (
    <>
      <header className="month-header">
        <h1 className="view-title">
          {MONTHS[month.month0]} {month.year}
        </h1>
        <div className="month-nav">
          <button className="icon-btn" aria-label="Mes anterior" onClick={() => shift(-1)}>
            ‹
          </button>
          <button className="btn" onClick={() => setMonth({ year: t.getFullYear(), month0: t.getMonth() })}>
            Hoy
          </button>
          <button className="icon-btn" aria-label="Mes siguiente" onClick={() => shift(1)}>
            ›
          </button>
        </div>
      </header>

      <section className="month">
        <div className="weekdays">
          {WEEKDAYS.map(w => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="grid" style={{ gridTemplateRows: `repeat(${cells.length / 7}, minmax(0, 1fr))` }}>
          {cells.map(c => {
            const events = eventsOn(data, c.key)
            const hidden = events.length - MAX_VISIBLE
            return (
              <div
                key={c.key}
                data-key={c.key}
                className={`day ${c.inMonth ? '' : 'other-month'} ${c.key === today ? 'today' : ''}`}
                onClick={() => newEvent(c.key)}
              >
                <span className="day-number">{c.day}</span>
                {events.slice(0, MAX_VISIBLE).map(e => (
                  <EventChip key={e.id} event={e} onClick={() => setOpen({ kind: 'event', event: e })} />
                ))}
                {hidden > 0 ? (
                  <button
                    className="more"
                    onClick={e => {
                      e.stopPropagation()
                      setOpen({ kind: 'day', key: c.key })
                    }}
                  >
                    +{hidden} más
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>

      {open?.kind === 'event' ? (
        <EventDialog
          key={open.event.id || open.event.date}
          event={open.event}
          onClose={() => setOpen(null)}
          onSave={e => {
            update(d => upsertEvent(d, e.id ? e : { ...e, id: newId() }))
            setOpen(null)
          }}
          onDelete={
            open.event.id
              ? () => {
                  update(d => deleteEvent(d, open.event.id))
                  setOpen(null)
                }
              : undefined
          }
        />
      ) : null}
      {open?.kind === 'day' ? (
        <DayDialog
          dayKey={open.key}
          events={eventsOn(data, open.key)}
          onPick={e => setOpen({ kind: 'event', event: e })}
          onNew={() => newEvent(open.key)}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  )
}
