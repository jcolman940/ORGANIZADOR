const pad = (n: number) => String(n).padStart(2, '0')

/** Clave 'YYYY-MM-DD' del día local. Nunca usar toISOString: en UTC-3 cambia de día a la noche. */
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromKey(k: string): Date {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 0 = lunes … 6 = domingo */
export function weekdayMon0(d: Date): number {
  return (d.getDay() + 6) % 7
}

export interface GridCell {
  key: string
  day: number
  inMonth: boolean
}

/** Semanas completas de lunes a domingo que cubren el mes. */
export function monthGrid(year: number, month0: number): GridCell[] {
  const first = new Date(year, month0, 1)
  const offset = weekdayMon0(first)
  const daysInMonth = new Date(year, month0 + 1, 0).getDate()
  const total = Math.ceil((offset + daysInMonth) / 7) * 7
  const cells: GridCell[] = []
  for (let i = 0; i < total; i++) {
    const d = new Date(year, month0, 1 - offset + i)
    cells.push({ key: dateKey(d), day: d.getDate(), inMonth: d.getMonth() === month0 })
  }
  return cells
}

export function msUntilNextMidnight(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return next.getTime() - now.getTime()
}
