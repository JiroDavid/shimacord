import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GamePicker } from './GamePicker'

const search = vi.fn()
beforeEach(() => {
  search.mockReset()
  search.mockResolvedValue([{ appId: '1', name: 'Valorant', iconUrl: null }])
  ;(window as unknown as { shima: unknown }).shima = { games: { search, status: async () => 'network' } }
})

test('shows results for a typed query and calls onPick', async () => {
  const onPick = vi.fn()
  render(<GamePicker onPick={onPick} />)
  await userEvent.type(screen.getByPlaceholderText(/search games/i), 'valo')
  const result = await screen.findByRole('button', { name: 'Valorant' })
  await userEvent.click(result)
  expect(onPick).toHaveBeenCalledWith({ appId: '1', name: 'Valorant', iconUrl: null })
})

test('debounces searches to one call for rapid typing', async () => {
  render(<GamePicker onPick={vi.fn()} />)
  await userEvent.type(screen.getByPlaceholderText(/search games/i), 'valo')
  await screen.findByRole('button', { name: 'Valorant' })
  expect(search).toHaveBeenCalledTimes(1)
  expect(search).toHaveBeenCalledWith('valo')
})

test('shows a notice when the game list is unavailable', async () => {
  ;(window as unknown as { shima: { games: { status: () => Promise<string> } } }).shima.games.status = async () => 'none'
  render(<GamePicker onPick={vi.fn()} />)
  expect(await screen.findByText(/game list unavailable/i)).toBeInTheDocument()
})
