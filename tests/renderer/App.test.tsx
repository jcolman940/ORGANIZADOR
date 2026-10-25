// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { App } from '../../src/renderer/App'
import { mockApi } from './mockApi'

beforeEach(() => {
  mockApi()
})

test('arranca en Calendario y navega a Tareas', async () => {
  render(<App />)
  const cal = await screen.findByRole('button', { name: 'Calendario' })
  expect(cal).toHaveAttribute('aria-current', 'page')
  await userEvent.click(screen.getByRole('button', { name: 'Tareas' }))
  expect(screen.getByRole('button', { name: 'Tareas' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('button', { name: 'Calendario' })).not.toHaveAttribute('aria-current')
})

test('el sidebar muestra todas las secciones', async () => {
  render(<App />)
  expect(await screen.findByText('Organizador')).toBeInTheDocument()
  for (const name of ['Calendario', 'Tareas', 'Tablero', 'Ajustes']) {
    expect(screen.getByRole('button', { name })).toBeInTheDocument()
  }
})

test('si no puede abrir los datos lo dice y permite reintentar', async () => {
  const api = mockApi()
  api.load.mockRejectedValueOnce(new Error('EACCES'))
  render(<App />)
  expect(await screen.findByText('No se pudieron abrir tus datos.')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
  expect(await screen.findByRole('heading', { name: /2026|20\d\d/ })).toBeInTheDocument()
})

test('avisa cuando los datos estaban dañados y dónde quedó la copia', async () => {
  const api = mockApi()
  api.load.mockResolvedValueOnce({ data: { version: 1, events: [], tasks: [], checks: {}, board: [] }, recoveredFrom: 'C:\\datos\\data.corrupt-1.json' })
  render(<App />)
  expect(await screen.findByRole('alert')).toHaveTextContent('C:\\datos\\data.corrupt-1.json')
})

test('avisa si un guardado falla', async () => {
  const api = mockApi()
  api.save.mockRejectedValue(new Error('EPERM'))
  render(<App />)
  await screen.findByRole('heading', { name: /20\d\d/ })
  await userEvent.click(document.querySelector('[data-key]') as HTMLElement)
  await userEvent.type(screen.getByLabelText('Título'), 'X')
  await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
  expect(await screen.findByRole('alert', {}, { timeout: 2000 })).toHaveTextContent('No se pudo guardar')
})
