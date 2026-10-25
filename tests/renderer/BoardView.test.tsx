// @vitest-environment jsdom
import { createEvent, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test, vi } from 'vitest'
import { emptyData, type AppData } from '@shared/types'
import { BoardView } from '../../src/renderer/views/BoardView'

function Harness({ initial = emptyData }: { initial?: AppData }) {
  const [data, setData] = useState(initial)
  return <BoardView data={data} update={fn => setData(d => fn(d))} />
}

const column = (name: string) => screen.getByRole('region', { name })
const withCard: AppData = { ...emptyData, board: [{ id: 'c1', title: 'Revisar logs', description: 'del servidor 3', column: 'todo' }] }

test('muestra las tres columnas con contador', () => {
  render(<Harness initial={withCard} />)
  expect(within(column('Por hacer')).getByText('1')).toBeInTheDocument()
  expect(within(column('En curso')).getByText('0')).toBeInTheDocument()
  expect(within(column('Hecho')).getByText('0')).toBeInTheDocument()
})

test('crear una tarjeta en Por hacer', async () => {
  render(<Harness />)
  await userEvent.click(within(column('Por hacer')).getByRole('button', { name: 'Nueva tarjeta' }))
  const dialog = screen.getByRole('dialog')
  await userEvent.type(within(dialog).getByLabelText('Título'), 'Armar informe')
  await userEvent.type(within(dialog).getByLabelText('Descripción (opcional)'), 'para el lunes')
  await userEvent.click(within(dialog).getByRole('button', { name: 'Guardar' }))
  expect(within(column('Por hacer')).getByText('Armar informe')).toBeInTheDocument()
  expect(within(column('Por hacer')).getByText('para el lunes')).toBeInTheDocument()
})

test('no guarda sin título', async () => {
  render(<Harness />)
  await userEvent.click(within(column('Por hacer')).getByRole('button', { name: 'Nueva tarjeta' }))
  await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Guardar' }))
  expect(screen.getByText('Escribí un título')).toBeInTheDocument()
})

test('arrastrar una tarjeta a En curso', () => {
  render(<Harness initial={withCard} />)
  const store: Record<string, string> = {}
  const dataTransfer = { setData: (k: string, v: string) => (store[k] = v), getData: (k: string) => store[k], effectAllowed: '', dropEffect: '' }
  const card = within(column('Por hacer')).getByText('Revisar logs').closest('[draggable]')!
  fireEvent(card, Object.assign(createEvent.dragStart(card), { dataTransfer }))
  const target = column('En curso')
  fireEvent(target, Object.assign(createEvent.dragOver(target), { dataTransfer }))
  fireEvent(target, Object.assign(createEvent.drop(target), { dataTransfer }))
  expect(within(column('En curso')).getByText('Revisar logs')).toBeInTheDocument()
  expect(within(column('Por hacer')).queryByText('Revisar logs')).toBeNull()
})

test('mover con el menú "Mover a…"', async () => {
  render(<Harness initial={withCard} />)
  await userEvent.selectOptions(within(column('Por hacer')).getByLabelText('Mover a…'), 'done')
  expect(within(column('Hecho')).getByText('Revisar logs')).toBeInTheDocument()
})

test('editar y eliminar', async () => {
  render(<Harness initial={withCard} />)
  await userEvent.click(screen.getByText('Revisar logs'))
  const dialog = screen.getByRole('dialog')
  const title = within(dialog).getByLabelText('Título')
  await userEvent.clear(title)
  await userEvent.type(title, 'Revisar logs viejos')
  await userEvent.click(within(dialog).getByRole('button', { name: 'Guardar' }))
  expect(screen.getByText('Revisar logs viejos')).toBeInTheDocument()

  await userEvent.click(screen.getByText('Revisar logs viejos'))
  window.confirm = vi.fn(() => true)
  await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }))
  expect(screen.queryByText('Revisar logs viejos')).toBeNull()
})
