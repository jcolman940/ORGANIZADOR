import { mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, expect, test } from 'vitest'
import { loadData, saveData } from '../../src/main/storage'
import { emptyData, type AppData } from '@shared/types'

let dir: string
let file: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'organizador-'))
  file = join(dir, 'data.json')
})

const sample: AppData = {
  version: 1,
  events: [{ id: 'e1', date: '2026-10-22', title: 'Parcial Análisis', type: 'parcial' }],
  tasks: [{ id: 't1', name: 'Precarga', recurrence: { kind: 'weekdays', days: [0, 1, 2, 3, 4] }, steps: [{ id: 's1', text: 'Copiar', command: 'C:\\x "y"\r\nz ' }] }],
  checks: { '2026-10-25': { t1: ['s1'] } },
  board: [{ id: 'c1', title: 'Pendiente', column: 'todo' }]
}

test('sin archivo devuelve datos vacíos y firstRun', async () => {
  expect(await loadData(file, '2026-10-25')).toEqual({ data: emptyData, firstRun: true })
})

test('guarda y vuelve a cargar lo mismo', async () => {
  await saveData(file, sample)
  const { data, firstRun } = await loadData(file, '2026-10-25')
  expect(firstRun).toBe(false)
  expect(data).toEqual(sample)
})

test('la escritura es atómica: no deja .tmp', async () => {
  await saveData(file, sample)
  expect((await readdir(dir)).filter(f => f.endsWith('.tmp'))).toEqual([])
})

test('archivo corrupto: datos vacíos y respaldo del original', async () => {
  await writeFile(file, '{nope')
  const { data } = await loadData(file, '2026-10-25')
  expect(data).toEqual(emptyData)
  const backups = (await readdir(dir)).filter(f => /^data\.corrupt-\d+\.json$/.test(f))
  expect(backups).toHaveLength(1)
  expect(await readFile(join(dir, backups[0]), 'utf8')).toBe('{nope')
})

test('descarta los checks de días anteriores', async () => {
  await saveData(file, { ...sample, checks: { '2026-10-20': { t1: ['s1'] }, '2026-10-25': { t1: ['s1'] } } })
  const { data } = await loadData(file, '2026-10-25')
  expect(Object.keys(data.checks)).toEqual(['2026-10-25'])
})

test('completa campos faltantes con valores por defecto', async () => {
  await writeFile(file, JSON.stringify({ version: 1, events: [], tasks: [], checks: {} }))
  const { data } = await loadData(file, '2026-10-25')
  expect(data.board).toEqual([])
  expect(data.version).toBe(1)
})
