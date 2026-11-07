import { buildTrayMenu } from './tray'
import type { Look, PresenceStatus } from '../shared/types'

const mk = (id: string, name: string): Look => ({
  id,
  name,
  kind: 'custom',
  appId: null,
  gameName: null,
  details: 'dd',
  state: '',
  largeImageUrl: '',
  smallImageUrl: '',
  showTimer: false
})
const looks = [mk('a', 'Alpha'), mk('b', 'Beta')]
const idle: PresenceStatus = { state: 'idle', lookId: null, message: null }
const live: PresenceStatus = { state: 'live', lookId: 'b', message: null }
const actions = { goLive: vi.fn(), stop: vi.fn(), show: vi.fn(), quit: vi.fn() }

test('one item per look with the live look checked', () => {
  const items = buildTrayMenu(looks, live, actions).filter((i) => i.type === 'checkbox')
  expect(items.map((i) => [i.label, i.checked])).toEqual([
    ['Alpha', false],
    ['Beta', true]
  ])
})

test('clicking a look goes live with its id', () => {
  const item = buildTrayMenu(looks, idle, actions).find((i) => i.label === 'Alpha')!
  ;(item.click as () => void)()
  expect(actions.goLive).toHaveBeenCalledWith('a')
})

test('Stop is enabled only when live', () => {
  const stop = (s: PresenceStatus) => buildTrayMenu(looks, s, actions).find((i) => i.label === 'Stop')
  expect(stop(idle)?.enabled).toBe(false)
  expect(stop(live)?.enabled).toBe(true)
})

test('has Quit', () => {
  const quit = buildTrayMenu(looks, idle, actions).find((i) => i.label === 'Quit')
  ;(quit!.click as () => void)()
  expect(actions.quit).toHaveBeenCalled()
})
