import { vi } from 'vitest'
import { emptyData, type AppData } from '@shared/types'

/** Instala un window.api falso y devuelve sus mocks. */
export function mockApi(initial: AppData = emptyData) {
  const api = {
    load: vi.fn(async () => structuredClone(initial)),
    save: vi.fn(async (_d: AppData) => {}),
    getAutoStart: vi.fn(async () => true),
    setAutoStart: vi.fn(async (_on: boolean) => {})
  }
  window.api = api
  return api
}
