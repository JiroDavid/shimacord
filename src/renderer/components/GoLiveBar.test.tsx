import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoLiveBar } from './GoLiveBar'
import type { PresenceStatus } from '../../shared/types'

const st = (state: PresenceStatus['state'], message: string | null = null): PresenceStatus => ({ state, lookId: 'a', message })
const setup = (status: PresenceStatus, extra: { selectedId?: string | null; valid?: boolean } = {}) => {
  const onGoLive = vi.fn()
  const onStop = vi.fn()
  render(
    <GoLiveBar
      status={status}
      selectedId={extra.selectedId === undefined ? 'a' : extra.selectedId}
      valid={extra.valid ?? true}
      onGoLive={onGoLive}
      onStop={onStop}
    />
  )
  return { onGoLive, onStop }
}

test('idle shows Go live and calls onGoLive', async () => {
  const { onGoLive } = setup(st('idle'))
  await userEvent.click(screen.getByRole('button', { name: 'Go live' }))
  expect(onGoLive).toHaveBeenCalled()
})

test('connecting disables the button', () => {
  setup(st('connecting'))
  expect(screen.getByRole('button', { name: /connecting/i })).toBeDisabled()
})

test('live shows Stop and a live dot', async () => {
  const { onStop } = setup(st('live'))
  expect(screen.getByTestId('live-dot')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Stop' }))
  expect(onStop).toHaveBeenCalled()
})

test('discord-missing shows the helper text and the mascot', () => {
  setup(st('discord-missing', 'Discord not found'))
  expect(screen.getByText('Open Discord and we will connect')).toBeInTheDocument()
  expect(screen.getByRole('img', { name: /mascot/i })).toBeInTheDocument()
})

test('error shows the message', () => {
  setup(st('error', 'boom'))
  expect(screen.getByText('boom')).toBeInTheDocument()
})

test('Go live is disabled when the look is invalid or nothing is selected', () => {
  setup(st('idle'), { valid: false })
  expect(screen.getByRole('button', { name: 'Go live' })).toBeDisabled()
})

test('Go live is disabled with no selection', () => {
  setup(st('idle'), { selectedId: null })
  expect(screen.getByRole('button', { name: 'Go live' })).toBeDisabled()
})

test('live with a different look selected still offers Go live', async () => {
  const onGoLive = vi.fn()
  render(<GoLiveBar status={st('live')} selectedId="b" valid onGoLive={onGoLive} onStop={vi.fn()} />)
  await userEvent.click(screen.getByRole('button', { name: 'Go live' }))
  expect(onGoLive).toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
})

test('live with the same look selected shows only Stop', () => {
  setup(st('live'))
  expect(screen.queryByRole('button', { name: 'Go live' })).toBeNull()
})
