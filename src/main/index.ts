import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import { registerIpc } from './ipc'

const APP_ID = 'com.julian.organizador'
const FLUSH_TIMEOUT_MS = 3000

// En desarrollo se usa otra carpeta de datos para no tocar los datos reales ni el arranque con Windows.
if (!app.isPackaged) app.setPath('userData', join(app.getPath('appData'), 'Organizador-dev'))
app.setAppUserModelId(APP_ID)

let mainWindow: BrowserWindow | null = null
let quitting = false

/** Pide a la interfaz que guarde lo pendiente y espera a que termine de escribirse en disco. */
function flushRenderer(win: BrowserWindow, flushDisk: () => Promise<void>): Promise<void> {
  return new Promise(resolve => {
    const done = () => {
      clearTimeout(timeout)
      ipcMain.removeListener('app:flushed', done)
      flushDisk().finally(resolve)
    }
    const timeout = setTimeout(done, FLUSH_TIMEOUT_MS)
    ipcMain.once('app:flushed', done)
    win.webContents.send('app:flush')
  })
}

function createWindow(flushDisk: () => Promise<void>): BrowserWindow {
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

  // Antes de cerrar se guarda todo; recién después se destruye la ventana.
  win.on('close', e => {
    if (quitting) return
    e.preventDefault()
    quitting = true
    void flushRenderer(win, flushDisk).then(() => win.destroy())
  })

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
    const { flush } = registerIpc()
    mainWindow = createWindow(flush)
    // Al cerrar sesión o apagar Windows: guardar lo que se pueda antes de que corten.
    mainWindow.on('session-end', () => {
      if (mainWindow) void flushRenderer(mainWindow, flush)
    })
  })

  app.on('window-all-closed', () => app.quit())
}
