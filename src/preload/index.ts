import { contextBridge, ipcRenderer } from 'electron'
import type { AppData } from '@shared/types'

contextBridge.exposeInMainWorld('api', {
  load: (): Promise<AppData> => ipcRenderer.invoke('data:load'),
  save: (data: AppData): Promise<void> => ipcRenderer.invoke('data:save', data),
  getAutoStart: (): Promise<boolean> => ipcRenderer.invoke('autostart:get'),
  setAutoStart: (on: boolean): Promise<void> => ipcRenderer.invoke('autostart:set', on)
})
