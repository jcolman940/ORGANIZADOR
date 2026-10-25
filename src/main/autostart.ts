import { access, writeFile } from 'node:fs/promises'

/**
 * Activa el arranque con Windows una sola vez, la primera vez que corre instalada.
 * La marca en disco evita volver a activarlo si después el usuario lo desactivó.
 */
export async function initAutostart(flagFile: string, isPackaged: boolean, enable: () => void): Promise<void> {
  if (!isPackaged) return
  try {
    await access(flagFile)
    return
  } catch {
    // Todavía no se inicializó.
  }
  enable()
  await writeFile(flagFile, new Date().toISOString(), 'utf8')
}
