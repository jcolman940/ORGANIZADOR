// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import type { Task } from '@shared/types'
import { TaskEditor } from '../../src/renderer/components/TaskEditor'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
let onSave: ReturnType<typeof vi.fn<(t: Task) => void>>
let onDelete: ReturnType<typeof vi.fn<(id: string) => void>>
let onClose: ReturnType<typeof vi.fn<() => void>>
beforeEach(() => {
  onSave = vi.fn<(t: Task) => void>()
  onDelete = vi.fn<(id: string) => void>()
  onClose = vi.fn<() => void>()
})

const open = (task: Task | null) => render(<TaskEditor task={task} onSave={onSave} onDelete={onDelete} onClose={onClose} />)
const checkedDays = () => DAYS.filter(d => (screen.getByRole('checkbox', { name: d }) as HTMLInputElement).checked)

test('tarea nueva: Lun a Vie por defecto y sin pasos', () => {
  open(null)
  expect(screen.getByLabelText('Nombre')).toHaveValue('')
  expect(screen.getByRole('radio', { name: 'Días de la semana' })).toBeChecked()
  expect(checkedDays()).toEqual(['Lun', 'Mar', 'Mié', 'Jue', 'Vie'])
  expect(screen.queryAllByLabelText('Texto')).toHaveLength(0)
})

test('botones rápidos de días', async () => {
  open(null)
  await userEvent.click(screen.getByRole('button', { name: 'Todos los días' }))
  expect(checkedDays()).toEqual(DAYS)
  await userEvent.click(screen.getByRole('button', { name: 'Lun a Vie' }))
  expect(checkedDays()).toEqual(['Lun', 'Mar', 'Mié', 'Jue', 'Vie'])
})

test('guarda una tarea con fecha específica y pasos', async () => {
  open(null)
  await userEvent.type(screen.getByLabelText('Nombre'), 'Precargar radar')
  await userEvent.click(screen.getByRole('radio', { name: 'Fecha específica' }))
  fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-11-03' } })
  await userEvent.click(screen.getByRole('button', { name: 'Agregar paso' }))
  await userEvent.click(screen.getByRole('button', { name: 'Agregar paso' }))
  const texts = screen.getAllByLabelText('Texto')
  await userEvent.type(texts[0], 'Abrir consola')
  fireEvent.change(screen.getAllByLabelText('Comando (opcional)')[0], { target: { value: 'cd C:\\radar\r\nrun.bat ' } })
  await userEvent.type(texts[1], 'Revisar')
  await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

  const saved = onSave.mock.calls[0][0]
  expect(saved.name).toBe('Precargar radar')
  expect(saved.recurrence).toEqual({ kind: 'date', date: '2026-11-03' })
  expect(saved.steps.map(s => s.text)).toEqual(['Abrir consola', 'Revisar'])
  // El textarea del navegador normaliza CRLF a LF; barras, espacios y saltos se conservan.
  expect(saved.steps[0].command).toBe('cd C:\\radar\nrun.bat ')
  expect(saved.steps[1].command).toBeUndefined()
  expect(saved.id).toBeTruthy()
})

test('reordena y borra pasos', async () => {
  const task: Task = {
    id: 't',
    name: 'X',
    recurrence: { kind: 'weekdays', days: [0] },
    steps: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
      { id: 'c', text: 'C' }
    ]
  }
  open(task)
  await userEvent.click(screen.getAllByRole('button', { name: 'Bajar' })[0])
  await userEvent.click(screen.getAllByRole('button', { name: 'Borrar paso' })[2])
  await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
  expect(onSave.mock.calls[0][0].steps.map(s => s.id)).toEqual(['b', 'a'])
  expect(onSave.mock.calls[0][0].id).toBe('t')
})

test('validaciones', async () => {
  open(null)
  await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
  expect(screen.getByText('Escribí un nombre')).toBeInTheDocument()
  await userEvent.type(screen.getByLabelText('Nombre'), 'Algo')
  for (const d of ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']) await userEvent.click(screen.getByRole('checkbox', { name: d }))
  await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
  expect(screen.getByText('Elegí al menos un día')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('radio', { name: 'Fecha específica' }))
  await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
  expect(screen.getByText('Elegí una fecha')).toBeInTheDocument()
  expect(onSave).not.toHaveBeenCalled()
})

test('eliminar pide confirmación', async () => {
  const task: Task = { id: 't', name: 'X', recurrence: { kind: 'weekdays', days: [0] }, steps: [] }
  open(task)
  window.confirm = vi.fn(() => false)
  await userEvent.click(screen.getByRole('button', { name: 'Eliminar tarea' }))
  expect(onDelete).not.toHaveBeenCalled()
  window.confirm = vi.fn(() => true)
  await userEvent.click(screen.getByRole('button', { name: 'Eliminar tarea' }))
  expect(onDelete).toHaveBeenCalledWith('t')
})

test('una tarea nueva no tiene botón eliminar', () => {
  open(null)
  expect(within(screen.getByRole('dialog')).queryByRole('button', { name: 'Eliminar tarea' })).toBeNull()
})
