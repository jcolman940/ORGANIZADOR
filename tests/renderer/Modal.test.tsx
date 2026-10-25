// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import { Modal } from '../../src/renderer/components/Modal'

let onClose: ReturnType<typeof vi.fn<() => void>>
beforeEach(() => {
  onClose = vi.fn<() => void>()
  render(
    <Modal title="Prueba" onClose={onClose}>
      <input aria-label="Campo" />
    </Modal>
  )
  // jsdom no calcula layout: se fija el rectángulo del diálogo a mano.
  const dialog = screen.getByRole('dialog')
  dialog.getBoundingClientRect = () => ({ left: 100, top: 100, right: 500, bottom: 400, width: 400, height: 300, x: 100, y: 100, toJSON: () => ({}) })
})

test('seleccionar texto y soltar afuera del campo no cierra el diálogo', () => {
  const dialog = screen.getByRole('dialog')
  fireEvent.mouseDown(screen.getByLabelText('Campo'), { clientX: 200, clientY: 200 })
  fireEvent.click(dialog, { clientX: 50, clientY: 50 })
  expect(onClose).not.toHaveBeenCalled()
})

test('un clic en el borde interno del diálogo no lo cierra', () => {
  const dialog = screen.getByRole('dialog')
  fireEvent.mouseDown(dialog, { clientX: 110, clientY: 110 })
  fireEvent.click(dialog, { clientX: 110, clientY: 110 })
  expect(onClose).not.toHaveBeenCalled()
})

test('un clic completo afuera del diálogo lo cierra', () => {
  const dialog = screen.getByRole('dialog')
  fireEvent.mouseDown(dialog, { clientX: 50, clientY: 50 })
  fireEvent.click(dialog, { clientX: 50, clientY: 50 })
  expect(onClose).toHaveBeenCalledTimes(1)
})
