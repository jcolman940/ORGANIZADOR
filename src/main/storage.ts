import { open, readFile, rename as fsRename } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { emptyData, type AppData } from '@shared/types'

/** Completa campos faltantes y descarta los checks de días anteriores a `today`. */
function normalize(raw: Partial<AppData>, today: string): AppData {
  const checks: AppData['checks'] = {}
  for (const [key, value] of Object.entries(raw.checks ?? {})) {
    if (key >= today) checks[key] = value
  }
  return {
    version: 1,
    events: raw.events ?? [],
    tasks: raw.tasks ?? [],
    checks,
    board: raw.board ?? []
  }
}

export interface LoadResult {
  data: AppData
  firstRun: boolean
  /** Si el archivo estaba dañado, ruta donde quedó guardado el original. */
  recoveredFrom?: string
}

export async function loadData(file: string, today: string): Promise<LoadResult> {
  let text: string
  try {
    text = await readFile(file, 'utf8')
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return { data: structuredClone(emptyData), firstRun: true }
    throw err
  }
  try {
    return { data: normalize(JSON.parse(text), today), firstRun: false }
  } catch {
    // No pisar el archivo dañado: se guarda aparte para poder recuperarlo a mano.
    const backup = join(dirname(file), `data.corrupt-${Date.now()}.json`)
    await fsRename(file, backup)
    return { data: structuredClone(emptyData), firstRun: false, recoveredFrom: backup }
  }
}

const RETRYABLE = new Set(['EPERM', 'EBUSY', 'EACCES'])

export interface SaveOptions {
  rename?: (from: string, to: string) => Promise<void>
  retryDelayMs?: number
}

/**
 * Escribe en un temporal, lo fuerza a disco y lo renombra, así un corte de luz no deja el archivo a medias.
 * En Windows el antivirus o el indexador pueden bloquear el rename un instante: se reintenta.
 */
export async function saveData(file: string, data: AppData, opts: SaveOptions = {}): Promise<void> {
  const rename = opts.rename ?? fsRename
  const delay = opts.retryDelayMs ?? 50
  const tmp = `${file}.tmp`
  const handle = await open(tmp, 'w')
  try {
    await handle.writeFile(JSON.stringify(data, null, 2), 'utf8')
    await handle.sync()
  } finally {
    await handle.close()
  }
  for (let attempt = 0; ; attempt++) {
    try {
      await rename(tmp, file)
      return
    } catch (err) {
      if (attempt >= 5 || !RETRYABLE.has((err as NodeJS.ErrnoException).code ?? '')) throw err
      await new Promise(r => setTimeout(r, delay * (attempt + 1)))
    }
  }
}
