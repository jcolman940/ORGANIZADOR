import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppData } from '@shared/types'

const SAVE_DELAY_MS = 300

export type Update = (fn: (d: AppData) => AppData) => void

export function useAppData(): { data: AppData | null; update: Update } {
  const [data, setData] = useState<AppData | null>(null)
  const latest = useRef<AppData | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    window.api.load().then(d => {
      latest.current = d
      setData(d)
    })
  }, [])

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    if (latest.current) void window.api.save(latest.current)
  }, [])

  useEffect(() => {
    const onUnload = () => {
      if (timer.current) flush()
    }
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [flush])

  const update = useCallback(
    (fn: (d: AppData) => AppData) => {
      if (!latest.current) return
      latest.current = fn(latest.current)
      setData(latest.current)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(flush, SAVE_DELAY_MS)
    },
    [flush]
  )

  return { data, update }
}
