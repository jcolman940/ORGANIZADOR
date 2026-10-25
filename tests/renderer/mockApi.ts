import { vi } from 'vitest'
import { emptyData, type AppData } from '@shared/types'

/** Instala un window.api falso y devuelve sus mocks. */
export function mockApi(initial: AppData = emptyData) {
  let flushHandler: (() => void) | null = null
  const api = {
    load: vi.fn(async (): Promise<{ data: AppData; recoveredFrom?: string }> => ({ data: structuredClone(initial) })),
    save: vi.fn(async (_d: AppData) => {}),
    getAutoStart: vi.fn(async () => true),
    setAutoStart: vi.fn(async (_on: boolean) => {}),
    onFlushRequest: vi.fn((cb: () => void) => {
      flushHandler = cb
    }),
    flushDone: vi.fn(() => {}),
    /** Simula que main pide guardar todo antes de cerrar. */
    requestFlush: () => flushHandler?.()
  }
  window.api = api
  return api
}
