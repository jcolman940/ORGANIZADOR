/// <reference types="vite/client" />
import type { AppData } from '@shared/types'

declare global {
  interface Window {
    api: {
      load(): Promise<{ data: AppData; recoveredFrom?: string }>
      save(data: AppData): Promise<void>
      getAutoStart(): Promise<boolean>
      setAutoStart(on: boolean): Promise<void>
      onFlushRequest(cb: () => void): void
      flushDone(): void
    }
  }
}

export {}
