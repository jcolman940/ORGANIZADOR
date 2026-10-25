import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { registerIpc } from './ipc'

let mainWindow: BrowserWindow | null = null

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Organizador',
    autoHideMenuBar: true,
    show: false,
    backgroundColor: '#f9fafb',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  win.once('ready-to-show', () => win.show())
  if (process.env.ELECTRON_RENDERER_URL) win.loadURL(process.env.ELECTRON_RENDERER_URL)
  else win.loadFile(join(__dirname, '../renderer/index.html'))
  return win
}

// Una sola instancia: si ya está abierta, se trae al frente esa ventana.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  })

  app.whenReady().then(() => {
    registerIpc()
    mainWindow = createWindow()
  })

  app.on('window-all-closed', () => app.quit())
}
