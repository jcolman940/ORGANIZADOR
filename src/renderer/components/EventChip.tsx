import type { CalendarEvent } from '@shared/types'

export function EventChip({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  return (
    <button
      className={`event-chip ${event.type}`}
      title={event.time ? `${event.time} ${event.title}` : event.title}
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
    >
      {event.time ? <span className="event-time">{event.time}</span> : null}
      <span>{event.title}</span>
    </button>
  )
}
