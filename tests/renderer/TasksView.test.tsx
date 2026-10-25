// @vitest-environment jsdom
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { emptyData, type AppData, type Task } from '@shared/types'
import { TasksView } from '../../src/renderer/views/TasksView'

const COMMAND = 'C:\\precargas\\entrada  "x y"\r\npython conv.py  '

const weekday: Task = {
  id: 'lv',
  name: 'Precarga de videos',
  recurrence: { kind: 'weekdays', days: [0, 1, 2, 3, 4] },
  steps: [
    { id: 's1', text: 'Copiar videos', command: COMMAND },
    { id: 's2', text: 'Verificar granja' }
  ]
}
const dated: Task = { id: 'dt', name: 'Tarea del domingo', recurrence: { kind: 'date', date: '2026-10-25' }, steps: [{ id: 'x', text: 'Hacerlo' }] }

let onEdit: ReturnType<typeof vi.fn<(id: string | null) => void>>
function Harness({ initial, today = '2026-10-23' }: { initial: AppData; today?: string }) {
  const [data, setData] = useState(initial)
  return <TasksView data={data} update={fn => setData(d => fn(d))} today={today} onEdit={onEdit} />
}

let writeText: ReturnType<typeof vi.fn>
beforeEach(() => {
  onEdit = vi.fn<(id: string | null) => void>()
  writeText = vi.fn(async () => {})
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
})
afterEach(() => vi.useRealTimers())

test('Hoy muestra solo lo que corresponde; Todas muestra todo', async () => {
  render(<Harness initial={{ ...emptyData, tasks: [weekday, dated] }} today="2026-10-25" />)
  expect(screen.queryByText('Precarga de videos')).toBeNull()
  expect(screen.getByText('Tarea del domingo')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Todas' }))
  expect(screen.getByText('Precarga de videos')).toBeInTheDocument()
  expect(screen.getByText('Lun a Vie')).toBeInTheDocument()
})

test('el título despliega y pliega los pasos', async () => {
  render(<Harness initial={{ ...emptyData, tasks: [weekday] }} />)
  expect(screen.queryByText('Copiar videos')).toBeNull()
  await userEvent.click(screen.getByRole('button', { name: /Precarga de videos/ }))
  expect(screen.getByText('Copiar videos')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /Precarga de videos/ }))
  expect(screen.queryByText('Copiar videos')).toBeNull()
})

test('tildar actualiza el progreso y marca completa', async () => {
  render(<Harness initial={{ ...emptyData, tasks: [weekday] }} />)
  expect(screen.getByText('0 de 2')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /Precarga de videos/ }))
  await userEvent.click(screen.getByRole('checkbox', { name: 'Copiar videos' }))
  expect(screen.getByText('1 de 2')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('checkbox', { name: 'Verificar granja' }))
  expect(screen.getByText('2 de 2')).toHaveClass('complete')
})

test('copia el comando exacto', async () => {
  render(<Harness initial={{ ...emptyData, tasks: [weekday] }} />)
  await userEvent.click(screen.getByRole('button', { name: /Precarga de videos/ }))
  vi.useFakeTimers({ shouldAdvanceTime: true })
  await userEvent.click(screen.getByRole('button', { name: 'Copiar comando' }))
  expect(writeText).toHaveBeenCalledWith(COMMAND)
  expect(screen.getByRole('button', { name: 'Copiado' })).toBeInTheDocument()
  act(() => vi.advanceTimersByTime(1600))
  expect(screen.getByRole('button', { name: 'Copiar comando' })).toBeInTheDocument()
})

test('el comando multilínea conserva los saltos de línea', async () => {
  render(<Harness initial={{ ...emptyData, tasks: [weekday] }} />)
  await userEvent.click(screen.getByRole('button', { name: /Precarga de videos/ }))
  const pre = document.querySelector('pre')!
  expect(pre.textContent).toBe(COMMAND)
})

test('sin tareas para hoy muestra el estado vacío', async () => {
  render(<Harness initial={emptyData} />)
  expect(screen.getByText('No hay tareas para hoy')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Nueva tarea' }))
  expect(onEdit).toHaveBeenCalledWith(null)
})

test('el lápiz pide editar esa tarea', async () => {
  render(<Harness initial={{ ...emptyData, tasks: [weekday] }} />)
  const card = screen.getByRole('button', { name: /Precarga de videos/ }).closest('.task')! as HTMLElement
  await userEvent.click(within(card).getByRole('button', { name: 'Editar tarea' }))
  expect(onEdit).toHaveBeenCalledWith('lv')
})
