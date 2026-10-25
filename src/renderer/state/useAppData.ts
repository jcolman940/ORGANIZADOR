import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppData } from '@shared/types'

const SAVE_DELAY_MS = 300

export type Update = (fn: (d: AppData) => AppData) => void

export interface AppDataState {
  data: AppData | null
  update: Update
  /** El último guardado falló: lo cambiado puede no estar en disco. */
  saveError: boolean
  /** No se pudo leer el archivo de datos. */
  loadError: boolean
  /** Ruta del respaldo si el archivo de datos estaba dañado. */
  recoveredFrom?: string
  retry: () => void
}

export function useAppData(): AppDataState {
  const [data, setData] = useState<AppData | null>(null)
  const [saveError, setSaveError] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [recoveredFrom, setRecoveredFrom] = useState<string>()
  const latest = useRef<AppData | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(() => {
    setLoadError(false)
    window.api.load().then(
      r => {
        latest.current = r.data
        setRecoveredFrom(r.recoveredFrom)
        setData(r.data)
      },
      () => setLoadError(true)
    )
  }, [])

  useEffect(load, [load])

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    if (!latest.current) return
    try {
      await window.api.save(latest.current)
      setSaveError(false)
    } catch {
      setSaveError(true)
    }
  }, [])

  // Main pide guardar todo antes de cerrar la ventana y espera la confirmación.
  useEffect(() => {
    window.api.onFlushRequest(() => {
      void flush().finally(() => window.api.flushDone())
    })
  }, [flush])

  const update = useCallback<Update>(
    fn => {
      if (!latest.current) return
      latest.current = fn(latest.current)
      setData(latest.current)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => void flush(), SAVE_DELAY_MS)
    },
    [flush]
  )

  return { data, update, saveError, loadError, recoveredFrom, retry: load }
}
