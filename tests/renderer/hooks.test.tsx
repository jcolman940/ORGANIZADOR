// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import type { AppData } from '@shared/types'
import { useAppData } from '../../src/renderer/state/useAppData'
import { useToday } from '../../src/renderer/state/useToday'
import { mockApi } from './mockApi'

let api: ReturnType<typeof mockApi>
let saved: AppData[]
beforeEach(() => {
  api = mockApi()
  saved = []
  api.save.mockImplementation(async (d: AppData) => void saved.push(d))
})
afterEach(() => vi.useRealTimers())

const addCard = (id: string) => (d: AppData): AppData => ({ ...d, board: [...d.board, { id, title: id, column: 'todo' }] })

test('useAppData carga y guarda con debounce', async () => {
  const { result } = renderHook(() => useAppData())
  await waitFor(() => expect(result.current.data).not.toBeNull())
  vi.useFakeTimers()
  act(() => result.current.update(addCard('c')))
  act(() => result.current.update(addCard('e')))
  expect(result.current.data?.board).toHaveLength(2)
  expect(saved).toHaveLength(0)
  act(() => vi.advanceTimersByTime(300))
  expect(saved).toHaveLength(1)
  expect(saved[0].board).toHaveLength(2)
})

test('antes de cerrar guarda lo pendiente y avisa que terminó', async () => {
  const { result } = renderHook(() => useAppData())
  await waitFor(() => expect(result.current.data).not.toBeNull())
  act(() => result.current.update(addCard('c')))
  expect(saved).toHaveLength(0)
  await act(async () => api.requestFlush())
  await waitFor(() => expect(api.flushDone).toHaveBeenCalled())
  expect(saved).toHaveLength(1)
  expect(saved[0].board.map(c => c.id)).toEqual(['c'])
})

test('si un guardado falla lo informa, y se limpia cuando vuelve a andar', async () => {
  const { result } = renderHook(() => useAppData())
  await waitFor(() => expect(result.current.data).not.toBeNull())
  api.save.mockRejectedValueOnce(new Error('EPERM'))
  await act(async () => {
    result.current.update(addCard('c'))
    api.requestFlush()
  })
  await waitFor(() => expect(result.current.saveError).toBe(true))
  await act(async () => {
    result.current.update(addCard('d'))
    api.requestFlush()
  })
  await waitFor(() => expect(result.current.saveError).toBe(false))
})

test('si no puede cargar muestra el error y permite reintentar', async () => {
  api.load.mockRejectedValueOnce(new Error('EACCES'))
  const { result } = renderHook(() => useAppData())
  await waitFor(() => expect(result.current.loadError).toBe(true))
  expect(result.current.data).toBeNull()
  await act(async () => result.current.retry())
  await waitFor(() => expect(result.current.data).not.toBeNull())
  expect(result.current.loadError).toBe(false)
})

test('informa si los datos se recuperaron de un archivo dañado', async () => {
  api.load.mockResolvedValueOnce({ data: { version: 1, events: [], tasks: [], checks: {}, board: [] }, recoveredFrom: 'C:\\x\\data.corrupt-1.json' })
  const { result } = renderHook(() => useAppData())
  await waitFor(() => expect(result.current.recoveredFrom).toBe('C:\\x\\data.corrupt-1.json'))
})

test('useToday cambia de día a la medianoche', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 9, 25, 23, 59, 0))
  const { result } = renderHook(() => useToday())
  expect(result.current).toBe('2026-10-25')
  act(() => vi.advanceTimersByTime(61_000))
  expect(result.current).toBe('2026-10-26')
})

test('useToday no se traba si el reloj atrasa justo antes de medianoche', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 9, 25, 23, 59, 0))
  const { result } = renderHook(() => useToday())
  act(() => vi.advanceTimersByTime(59_000))
  // El reloj de Windows se corrige hacia atrás: el temporizador dispara y todavía es el 25.
  vi.setSystemTime(new Date(2026, 9, 25, 23, 59, 50))
  act(() => vi.advanceTimersByTime(2_000))
  expect(result.current).toBe('2026-10-25')
  act(() => vi.advanceTimersByTime(60_000))
  expect(result.current).toBe('2026-10-26')
})

test('useToday revisa la fecha al volver a la ventana', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 9, 25, 10, 0, 0))
  const { result } = renderHook(() => useToday())
  // La compu estuvo suspendida: el reloj saltó sin que corrieran los temporizadores.
  vi.setSystemTime(new Date(2026, 9, 26, 8, 0, 0))
  act(() => {
    window.dispatchEvent(new Event('focus'))
  })
  expect(result.current).toBe('2026-10-26')
})
