import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'

/** <dialog> modal nativo; Escape o un clic afuera lo cierran. */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const pressedOutside = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof el.showModal === 'function') el.showModal()
    else el.setAttribute('open', '')
    return () => {
      if (el.open && typeof el.close === 'function') el.close()
    }
  }, [])

  // El fondo es parte del <dialog>: se mira si el puntero está fuera de su rectángulo.
  const isOutside = (e: MouseEvent) => {
    if (e.target !== ref.current) return false
    const r = ref.current.getBoundingClientRect()
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
  }

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={e => {
        e.preventDefault()
        onClose()
      }}
      // Solo cierra si el clic empezó y terminó afuera: arrastrar al seleccionar texto no cuenta.
      onMouseDown={e => {
        pressedOutside.current = isOutside(e)
      }}
      onClick={e => {
        if (pressedOutside.current && isOutside(e)) onClose()
        pressedOutside.current = false
      }}
    >
      <h2 className="modal-title">{title}</h2>
      {children}
    </dialog>
  )
}
