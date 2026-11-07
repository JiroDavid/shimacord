import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LooksList } from './LooksList'
import type { Look } from '../../shared/types'

const mk = (id: string, name: string): Look => ({
  id, name, kind: 'custom', appId: null, gameName: null, details: 'dd',
  state: '', largeImageUrl: '', smallImageUrl: '', showTimer: false
})
const looks = [mk('a', 'Alpha'), mk('b', 'Beta')]
const handlers = () => ({ onSelect: vi.fn(), onCreate: vi.fn(), onDuplicate: vi.fn(), onRemove: vi.fn() })

test('renders names and highlights the selected look', () => {
  render(<LooksList looks={looks} selectedId="b" {...handlers()} />)
  expect(screen.getByText('Alpha')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Beta' })).toHaveAttribute('aria-current', 'true')
  expect(screen.getByRole('button', { name: 'Alpha' })).not.toHaveAttribute('aria-current')
})

test('click selects, duplicate and delete call back with id', async () => {
  const h = handlers()
  render(<LooksList looks={looks} selectedId="a" {...h} />)
  await userEvent.click(screen.getByRole('button', { name: 'Beta' }))
  expect(h.onSelect).toHaveBeenCalledWith('b')
  await userEvent.click(screen.getByRole('button', { name: 'Duplicate Alpha' }))
  expect(h.onDuplicate).toHaveBeenCalledWith('a')
  await userEvent.click(screen.getByRole('button', { name: 'Delete Alpha' }))
  expect(h.onRemove).toHaveBeenCalledWith('a')
})

test('shows the empty state when there are no looks', () => {
  render(<LooksList looks={[]} selectedId={null} {...handlers()} />)
  expect(screen.getByText(/no looks yet/i)).toBeInTheDocument()
})
