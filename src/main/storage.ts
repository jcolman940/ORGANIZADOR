import { readFile, rename, writeFile } from 'node:fs/promises'
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

export async function loadData(file: string, today: string): Promise<{ data: AppData; firstRun: boolean }> {
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
    await rename(file, join(dirname(file), `data.corrupt-${Date.now()}.json`))
    return { data: structuredClone(emptyData), firstRun: false }
  }
}

/** Escribe en un temporal y lo renombra, así un corte de luz no deja el archivo a medias. */
export async function saveData(file: string, data: AppData): Promise<void> {
  const tmp = `${file}.tmp`
  await writeFile(tmp, JSON.stringify(data, null, 2), 'utf8')
  await rename(tmp, file)
}
