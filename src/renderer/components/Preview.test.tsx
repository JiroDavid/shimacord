import { render, screen, fireEvent } from '@testing-library/react'
import { Preview } from './Preview'
import type { LookInput } from '../../shared/types'

const base: LookInput = {
  name: 'n', kind: 'custom', appId: null, gameName: null, details: 'Doing things',
  state: 'Very busy', largeImageUrl: '', smallImageUrl: '', showTimer: false
}

test('custom look shows Shimacord headline, details and state', () => {
  render(<Preview look={base} live={false} />)
  expect(screen.getByText('Shimacord')).toBeInTheDocument()
  expect(screen.getByText('Doing things')).toBeInTheDocument()
  expect(screen.getByText('Very busy')).toBeInTheDocument()
})

test('game look shows the game name', () => {
  render(<Preview look={{ ...base, kind: 'game', appId: '1', gameName: 'Valorant' }} live={false} />)
  expect(screen.getByText('Valorant')).toBeInTheDocument()
})

test('shows timer text only when showTimer', () => {
  const { rerender } = render(<Preview look={base} live={false} />)
  expect(screen.queryByText(/elapsed/i)).toBeNull()
  rerender(<Preview look={{ ...base, showTimer: true }} live={false} />)
  expect(screen.getByText(/elapsed/i)).toBeInTheDocument()
})

test('falls back to the mascot when image url is empty', () => {
  render(<Preview look={base} live={false} />)
  expect(screen.queryByAltText('Large image')).toBeNull()
  expect(screen.getByRole('img', { name: /mascot/i })).toBeInTheDocument()
})

test('shows the image, and falls back to the mascot when it errors', () => {
  render(<Preview look={{ ...base, largeImageUrl: 'https://x.com/a.png' }} live={false} />)
  const img = screen.getByAltText('Large image')
  expect(img).toHaveAttribute('src', 'https://x.com/a.png')
  fireEvent.error(img)
  expect(screen.queryByAltText('Large image')).toBeNull()
  expect(screen.getByRole('img', { name: /mascot/i })).toBeInTheDocument()
})

test('shows a live badge when live', () => {
  render(<Preview look={base} live />)
  expect(screen.getByText(/live/i)).toBeInTheDocument()
})
