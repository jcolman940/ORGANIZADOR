import { expect, test } from 'vitest'
import { chipsThatFit } from '../../src/renderer/views/chipsThatFit'

test('sin medir todavía (alto 0) usa el máximo por defecto', () => {
  expect(chipsThatFit(0, 4)).toBe(3)
  expect(chipsThatFit(0, 2)).toBe(2)
})

test('mes de 6 filas en la ventana por defecto: deja lugar para "+N más"', () => {
  expect(chipsThatFit(92.7, 4)).toBe(1)
})

test('mes de 5 filas: entran 3 si son exactamente 3', () => {
  expect(chipsThatFit(112.8, 3)).toBe(3)
})

test('mes de 5 filas con 4 eventos: 2 chips y "+2 más"', () => {
  expect(chipsThatFit(112.8, 4)).toBe(2)
})

test('celda muy baja: ningún chip, solo "+N más"', () => {
  expect(chipsThatFit(60, 2)).toBe(0)
})

test('sin eventos', () => {
  expect(chipsThatFit(120, 0)).toBe(0)
})
