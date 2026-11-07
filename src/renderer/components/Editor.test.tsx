import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Editor } from './Editor'
import type { LookInput } from '../../shared/types'

const base: LookInput = {
  name: 'Mine', kind: 'custom', appId: null, gameName: null, details: 'Doing things',
  state: '', largeImageUrl: '', smallImageUrl: '', showTimer: false
}

beforeEach(() => {
  ;(window as unknown as { shima: unknown }).shima = {
    games: { search: async () => [], status: async () => 'network' }
  }
})

function Harness({ initial, onSave }: { initial: LookInput; onSave: () => void }) {
  const [v, setV] = useState(initial)
  return <Editor value={v} onChange={setV} onSave={onSave} />
}

test('shows validation messages and disables Save until valid', async () => {
  const onSave = vi.fn()
  render(<Harness initial={{ ...base, details: 'a' }} onSave={onSave} />)
  expect(screen.getByText(/details must be 2 to 128/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  await userEvent.type(screen.getByLabelText('Details'), 'b')
  expect(screen.queryByText(/details must be/i)).toBeNull()
  const save = screen.getByRole('button', { name: 'Save' })
  expect(save).toBeEnabled()
  await userEvent.click(save)
  expect(onSave).toHaveBeenCalled()
})

test('custom kind hides the game picker and shows the Shimacord headline note', () => {
  render(<Harness initial={base} onSave={vi.fn()} />)
  expect(screen.queryByPlaceholderText(/search games/i)).toBeNull()
  expect(screen.getByText(/shown as .shimacord./i)).toBeInTheDocument()
})

test('switching to game shows the picker', async () => {
  render(<Harness initial={base} onSave={vi.fn()} />)
  await userEvent.click(screen.getByRole('button', { name: 'Game' }))
  expect(screen.getByPlaceholderText(/search games/i)).toBeInTheDocument()
})
