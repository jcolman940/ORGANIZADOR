// Medidas en px que salen de styles.css (.day, .day-number, .event-chip, .more).
const CELL_CHROME = 18 // padding 8+8 + borde 1+1
const NUMBER_H = 19
const GAP = 4
const CHIP_H = 20
const MORE_H = 16
const DEFAULT_MAX = 3

/** Cuántos chips de evento entran en una celda de `cellHeight` px, dejando lugar para "+N más" si hace falta. */
export function chipsThatFit(cellHeight: number, total: number): number {
  if (total === 0) return 0
  if (cellHeight <= 0) return Math.min(total, DEFAULT_MAX)
  const available = cellHeight - CELL_CHROME - NUMBER_H
  if (total * (CHIP_H + GAP) <= available) return total
  return Math.max(0, Math.floor((available - GAP - MORE_H) / (CHIP_H + GAP)))
}
