import { app, ipcMain } from 'electron'
import { join } from 'node:path'
import { dateKey } from '@shared/dates'
import type { AppData } from '@shared/types'
import { initAutostart } from './autostart'
import { createSaveQueue } from './saveQueue'
import { loadData, saveData } from './storage'

export function registerIpc() {
  const dir = app.getPath('userData')
  const file = join(dir, 'data.json')
  const queue = createSaveQueue<AppData>(data => saveData(file, data))
  const setAutoStart = (on: boolean) => app.setLoginItemSettings({ openAtLogin: on })

  ipcMain.handle('data:load', async () => {
    const { data, recoveredFrom } = await loadData(file, dateKey(new Date()))
    await initAutostart(join(dir, 'autostart-initialized'), app.isPackaged, () => setAutoStart(true))
    return { data, recoveredFrom }
  })
  ipcMain.handle('data:save', (_e, data: AppData) => queue.enqueue(data))
  ipcMain.handle('autostart:get', () => app.getLoginItemSettings().openAtLogin)
  ipcMain.handle('autostart:set', (_e, on: boolean) => setAutoStart(on))

  return { flush: () => queue.flush() }
}
