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
