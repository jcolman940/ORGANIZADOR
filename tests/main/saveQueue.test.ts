import { expect, test } from 'vitest'
import { createSaveQueue } from '../../src/main/saveQueue'

const deferred = () => {
  let resolve!: () => void
  const promise = new Promise<void>(r => (resolve = r))
  return { promise, resolve }
}

test('nunca hay dos guardados a la vez y gana el último', async () => {
  const gates: ReturnType<typeof deferred>[] = []
  const written: number[] = []
  let inFlight = 0
  let maxInFlight = 0
  const q = createSaveQueue<number>(async n => {
    inFlight++
    maxInFlight = Math.max(maxInFlight, inFlight)
    const g = deferred()
    gates.push(g)
    await g.promise
    written.push(n)
    inFlight--
  })
  const p1 = q.enqueue(1)
  const p2 = q.enqueue(2)
  const p3 = q.enqueue(3)
  await Promise.resolve()
  gates[0].resolve()
  await p1
  await new Promise(r => setTimeout(r, 0))
  gates[1].resolve()
  await Promise.all([p2, p3])
  expect(written).toEqual([1, 3])
  expect(maxInFlight).toBe(1)
})

test('flush espera a que termine lo pendiente', async () => {
  const written: number[] = []
  const q = createSaveQueue<number>(async n => {
    await new Promise(r => setTimeout(r, 5))
    written.push(n)
  })
  void q.enqueue(1)
  void q.enqueue(2)
  await q.flush()
  expect(written).toEqual([1, 2])
})

test('un error se propaga a quien guardó', async () => {
  const q = createSaveQueue<number>(async () => {
    throw new Error('disco lleno')
  })
  await expect(q.enqueue(1)).rejects.toThrow('disco lleno')
})
