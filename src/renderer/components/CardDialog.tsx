import { useState } from 'react'
import type { BoardCard } from '@shared/types'
import { Modal } from './Modal'

export function CardDialog({
  card,
  onSave,
  onDelete,
  onClose
}: {
  card: BoardCard
  onSave: (c: BoardCard) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [error, setError] = useState('')

  return (
    <Modal title={card.id ? 'Editar tarjeta' : 'Nueva tarjeta'} onClose={onClose}>
      <form
        className="form"
        onSubmit={e => {
          e.preventDefault()
          if (!title.trim()) return setError('Escribí un título')
          onSave({ ...card, title: title.trim(), description: description.trim() || undefined })
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
          Descripción (opcional)
          <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} />
        </label>
        <div className="form-actions">
          {onDelete ? (
            <button
              type="button"
              className="btn btn-danger spacer"
              onClick={() => {
                if (window.confirm(`¿Eliminar la tarjeta "${card.title}"?`)) onDelete()
              }}
            >
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
    </Modal>
  )
}
