import { contextBridge, ipcRenderer } from 'electron'
import type { AppData } from '@shared/types'

contextBridge.exposeInMainWorld('api', {
  load: (): Promise<{ data: AppData; recoveredFrom?: string }> => ipcRenderer.invoke('data:load'),
  save: (data: AppData): Promise<void> => ipcRenderer.invoke('data:save', data),
  getAutoStart: (): Promise<boolean> => ipcRenderer.invoke('autostart:get'),
  setAutoStart: (on: boolean): Promise<void> => ipcRenderer.invoke('autostart:set', on),
  onFlushRequest: (cb: () => void) => {
    ipcRenderer.removeAllListeners('app:flush')
    ipcRenderer.on('app:flush', () => cb())
  },
  flushDone: () => ipcRenderer.send('app:flushed')
})
