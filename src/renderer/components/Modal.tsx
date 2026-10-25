import { useEffect, useRef, type ReactNode } from 'react'

/** <dialog> modal nativo; Escape o clic afuera lo cierran. */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof el.showModal === 'function') el.showModal()
    else el.setAttribute('open', '')
    return () => {
      if (el.open && typeof el.close === 'function') el.close()
    }
  }, [])

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={e => {
        e.preventDefault()
        onClose()
      }}
      onClick={e => {
        if (e.target === ref.current) onClose()
      }}
    >
      <h2 className="modal-title">{title}</h2>
      {children}
    </dialog>
  )
}
