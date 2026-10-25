import { access, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, expect, test, vi } from 'vitest'
import { initAutostart } from '../../src/main/autostart'

let flag: string
beforeEach(async () => {
  flag = join(await mkdtemp(join(tmpdir(), 'organizador-')), 'autostart-initialized')
})

test('la primera vez que corre instalada activa el arranque y deja marca', async () => {
  const enable = vi.fn()
  await initAutostart(flag, true, enable)
  expect(enable).toHaveBeenCalledTimes(1)
  await expect(access(flag)).resolves.toBeUndefined()
})

test('si el usuario ya lo desactivó, no se vuelve a activar', async () => {
  const enable = vi.fn()
  await initAutostart(flag, true, enable)
  await initAutostart(flag, true, enable)
  expect(enable).toHaveBeenCalledTimes(1)
})

test('en desarrollo nunca toca el arranque con Windows', async () => {
  const enable = vi.fn()
  await initAutostart(flag, false, enable)
  expect(enable).not.toHaveBeenCalled()
})
