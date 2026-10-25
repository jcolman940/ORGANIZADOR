// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { emptyData, type AppData } from '@shared/types'
import { useAppData } from '../../src/renderer/state/useAppData'
import { useToday } from '../../src/renderer/state/useToday'

let saved: AppData[]
beforeEach(() => {
  saved = []
  window.api = {
    load: vi.fn(async () => structuredClone(emptyData)),
    save: vi.fn(async (d: AppData) => void saved.push(d)),
    getAutoStart: vi.fn(async () => true),
    setAutoStart: vi.fn(async () => {})
  }
})
afterEach(() => vi.useRealTimers())

test('useAppData carga y guarda con debounce', async () => {
  const { result } = renderHook(() => useAppData())
  await waitFor(() => expect(result.current.data).not.toBeNull())
  vi.useFakeTimers()
  act(() => result.current.update(d => ({ ...d, board: [{ id: 'c', title: 'x', column: 'todo' }] })))
  act(() => result.current.update(d => ({ ...d, board: [...d.board, { id: 'e', title: 'y', column: 'todo' }] })))
  expect(result.current.data?.board).toHaveLength(2)
  expect(saved).toHaveLength(0)
  act(() => vi.advanceTimersByTime(300))
  expect(saved).toHaveLength(1)
  expect(saved[0].board).toHaveLength(2)
})

test('useToday cambia de día a la medianoche', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 9, 25, 23, 59, 0))
  const { result } = renderHook(() => useToday())
  expect(result.current).toBe('2026-10-25')
  act(() => vi.advanceTimersByTime(61_000))
  expect(result.current).toBe('2026-10-26')
})
