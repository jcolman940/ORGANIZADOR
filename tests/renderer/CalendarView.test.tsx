// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { emptyData, type AppData, type CalendarEvent } from '@shared/types'
import { CalendarView } from '../../src/renderer/views/CalendarView'

function Harness({ initial = emptyData }: { initial?: AppData }) {
  const [data, setData] = useState(initial)
  return <CalendarView data={data} update={fn => setData(d => fn(d))} today="2026-10-16" />
}

const cell = (key: string) => document.querySelector(`[data-key="${key}"]`) as HTMLElement

test('muestra el mes de hoy y navega', async () => {
  render(<Harness />)
  expect(screen.getByRole('heading', { name: 'Octubre 2026' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Mes anterior' }))
  expect(screen.getByRole('heading', { name: 'Septiembre 2026' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }))
  await userEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }))
  expect(screen.getByRole('heading', { name: 'Noviembre 2026' })).toBeInTheDocument()
})

test('encabezados de lunes a domingo', () => {
  render(<Harness />)
  for (const d of ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']) expect(screen.getByText(d)).toBeInTheDocument()
})

test('marca hoy y los días de otro mes', () => {
  render(<Harness />)
  expect(cell('2026-10-16')).toHaveClass('today')
  expect(cell('2026-10-15')).not.toHaveClass('today')
  expect(cell('2026-09-28')).toHaveClass('other-month')
})

test('crear, editar y borrar un evento', async () => {
  render(<Harness />)
  await userEvent.click(cell('2026-10-22'))
  const dialog = screen.getByRole('dialog')
  await userEvent.type(within(dialog).getByLabelText('Título'), 'Parcial Análisis')
  await userEvent.selectOptions(within(dialog).getByLabelText('Tipo'), 'parcial')
  await userEvent.type(within(dialog).getByLabelText('Hora (opcional)'), '09:30')
  await userEvent.click(within(dialog).getByRole('button', { name: 'Guardar' }))

  const chip = within(cell('2026-10-22')).getByText('Parcial Análisis')
  expect(chip.closest('.event-chip')).toHaveClass('parcial')

  await userEvent.click(chip)
  const edit = screen.getByRole('dialog')
  expect(within(edit).getByLabelText('Título')).toHaveValue('Parcial Análisis')
  await userEvent.click(within(edit).getByRole('button', { name: 'Eliminar' }))
  expect(within(cell('2026-10-22')).queryByText('Parcial Análisis')).toBeNull()
})

test('no guarda un evento sin título', async () => {
  render(<Harness />)
  await userEvent.click(cell('2026-10-22'))
  await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Guardar' }))
  expect(screen.getByText('Escribí un título')).toBeInTheDocument()
})

test('más de 3 eventos muestra "+N más" y abre la lista del día', async () => {
  const events: CalendarEvent[] = [1, 2, 3, 4].map(i => ({ id: `e${i}`, date: '2026-10-22', title: `Ev ${i}`, type: 'recordatorio' }))
  render(<Harness initial={{ ...emptyData, events }} />)
  const c = cell('2026-10-22')
  expect(within(c).queryByText('Ev 4')).toBeNull()
  await userEvent.click(within(c).getByText('+1 más'))
  const dialog = screen.getByRole('dialog')
  for (const i of [1, 2, 3, 4]) expect(within(dialog).getByText(`Ev ${i}`)).toBeInTheDocument()
})
