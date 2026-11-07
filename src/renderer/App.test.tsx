import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'

const goLive = vi.fn()
beforeEach(() => {
  goLive.mockReset()
  const looks = [{ id: 'a', name: 'Chill', kind: 'custom', appId: null, gameName: null, details: 'resting', state: '', largeImageUrl: '', smallImageUrl: '', showTimer: false }]
  ;(window as unknown as { shima: unknown }).shima = {
    looks: { list: async () => looks, save: async (i: object) => ({ ...i, id: 'a' }), duplicate: vi.fn(), remove: vi.fn() },
    games: { search: async () => [], status: async () => 'network' },
    presence: { goLive, stop: vi.fn(), status: async () => ({ state: 'idle', lookId: null, message: null }), onStatus: () => () => undefined }
  }
})

test('renders the shell title', async () => {
  render(<App />)
  expect(screen.getByText('SHIMACORD')).toBeInTheDocument()
  expect(await screen.findByRole('button', { name: 'Chill' })).toBeInTheDocument()
})

test('Go live saves the draft and goes live with the selected id', async () => {
  render(<App />)
  await userEvent.click(await screen.findByRole('button', { name: 'Go live' }))
  expect(goLive).toHaveBeenCalledWith('a')
})
