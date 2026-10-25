// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { SettingsView } from '../../src/renderer/views/SettingsView'
import { mockApi } from './mockApi'

test('muestra y cambia el arranque con Windows', async () => {
  const api = mockApi()
  render(<SettingsView />)
  const toggle = screen.getByRole('checkbox', { name: 'Abrir al iniciar Windows' })
  await waitFor(() => expect(toggle).toBeChecked())
  await userEvent.click(toggle)
  expect(api.setAutoStart).toHaveBeenCalledWith(false)
  expect(toggle).not.toBeChecked()
})
