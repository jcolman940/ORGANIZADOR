import { app, ipcMain } from 'electron'
import { join } from 'node:path'
import { dateKey } from '@shared/dates'
import type { AppData } from '@shared/types'
import { loadData, saveData } from './storage'

export function registerIpc(): void {
  const file = join(app.getPath('userData'), 'data.json')

  ipcMain.handle('data:load', async () => {
    const { data, firstRun } = await loadData(file, dateKey(new Date()))
    // La primera vez que corre instalada queda configurada para abrir al iniciar Windows.
    if (firstRun && app.isPackaged) app.setLoginItemSettings({ openAtLogin: true })
    return data
  })
  ipcMain.handle('data:save', (_e, data: AppData) => saveData(file, data))
  ipcMain.handle('autostart:get', () => app.getLoginItemSettings().openAtLogin)
  ipcMain.handle('autostart:set', (_e, on: boolean) => app.setLoginItemSettings({ openAtLogin: on }))
}
