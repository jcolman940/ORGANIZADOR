import { useEffect, useState } from 'react'
import { dateKey, msUntilNextMidnight } from '@shared/dates'

const RECHECK_MS = 30_000

/**
 * Clave del día de hoy. Se actualiza a la medianoche y, por si el reloj se corrige
 * o la compu se suspende, también se revisa cada 30 s y al volver a la ventana.
 */
export function useToday(): string {
  const [today, setToday] = useState(() => dateKey(new Date()))

  useEffect(() => {
    const check = () => setToday(dateKey(new Date()))
    const atMidnight = setTimeout(check, msUntilNextMidnight(new Date()) + 50)
    const every = setInterval(check, RECHECK_MS)
    window.addEventListener('focus', check)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearTimeout(atMidnight)
      clearInterval(every)
      window.removeEventListener('focus', check)
      document.removeEventListener('visibilitychange', check)
    }
  }, [today])

  return today
}
