/// <reference types="vite/client" />
import type { AppData } from '@shared/types'

declare global {
  interface Window {
    api: {
      load(): Promise<AppData>
      save(data: AppData): Promise<void>
      getAutoStart(): Promise<boolean>
      setAutoStart(on: boolean): Promise<void>
    }
  }
}

export {}
