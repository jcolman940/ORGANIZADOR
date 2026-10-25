import { useState } from 'react'
import { deleteCard, moveCard, newId, upsertCard } from '@shared/ops'
import type { AppData, BoardCard, Column } from '@shared/types'
import { CardDialog } from '../components/CardDialog'
import type { Update } from '../state/useAppData'

const COLUMNS: { id: Column; label: string }[] = [
  { id: 'todo', label: 'Por hacer' },
  { id: 'doing', label: 'En curso' },
  { id: 'done', label: 'Hecho' }
]

export function BoardView({ data, update }: { data: AppData; update: Update }) {
  const [editing, setEditing] = useState<BoardCard | null>(null)
  const [over, setOver] = useState<Column | null>(null)

  return (
    <>
      <header className="month-header">
        <h1 className="view-title">Tablero</h1>
      </header>

      <div className="board">
        {COLUMNS.map(col => {
          const cards = data.board.filter(c => c.column === col.id)
          return (
            <section
              key={col.id}
              aria-labelledby={`col-${col.id}`}
              className={`board-column ${over === col.id ? 'drag-over' : ''}`}
              onDragOver={e => {
                e.preventDefault()
                setOver(col.id)
              }}
              onDragLeave={() => setOver(null)}
              onDrop={e => {
                e.preventDefault()
                setOver(null)
                const id = e.dataTransfer.getData('text/plain')
                if (id) update(d => moveCard(d, id, col.id))
              }}
            >
              <header className="board-column-head">
                <h2 id={`col-${col.id}`}>{col.label}</h2>
                <span className="count">{cards.length}</span>
              </header>
              <div className="board-cards">
                {cards.map(card => (
                  <article
                    key={card.id}
                    className="card board-card"
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.setData('text/plain', card.id)
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onClick={() => setEditing(card)}
                  >
                    <p className="board-card-title">{card.title}</p>
                    {card.description ? <p className="board-card-desc">{card.description}</p> : null}
                    <select
                      aria-label="Mover a…"
                      className="move-select"
                      value=""
                      onClick={e => e.stopPropagation()}
                      onChange={e => update(d => moveCard(d, card.id, e.target.value as Column))}
                    >
                      <option value="" disabled>
                        Mover a…
                      </option>
                      {COLUMNS.filter(c => c.id !== col.id).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </article>
                ))}
              </div>
              <button className="btn add-card" onClick={() => setEditing({ id: '', title: '', column: col.id })}>
                Nueva tarjeta
              </button>
            </section>
          )
        })}
      </div>

      {editing ? (
        <CardDialog
          key={editing.id || editing.column}
          card={editing}
          onClose={() => setEditing(null)}
          onSave={c => {
            update(d => upsertCard(d, c.id ? c : { ...c, id: newId() }))
            setEditing(null)
          }}
          onDelete={
            editing.id
              ? () => {
                  update(d => deleteCard(d, editing.id))
                  setEditing(null)
                }
              : undefined
          }
        />
      ) : null}
    </>
  )
}
