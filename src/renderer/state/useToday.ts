import { useEffect, useState } from 'react'
import { dateKey, msUntilNextMidnight } from '@shared/dates'

/** Clave del día de hoy; se actualiza sola al pasar la medianoche. */
export function useToday(): string {
  const [today, setToday] = useState(() => dateKey(new Date()))

  useEffect(() => {
    const id = setTimeout(() => setToday(dateKey(new Date())), msUntilNextMidnight(new Date()) + 50)
    return () => clearTimeout(id)
  }, [today])

  return today
}
