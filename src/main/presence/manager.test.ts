import { PresenceManager, buildActivity } from './manager'
import { DiscordMissingError, SHIMACORD_APP_ID } from './client'
import type { ActivityPayload, PresenceClient } from './client'
import type { Look, PresenceStatus } from '../../shared/types'

class FakeClient implements PresenceClient {
  connected: string | null = null
  activity: ActivityPayload | null = null
  disconnected = false
  closeCb: (() => void) | null = null
  constructor(
    private readonly log: string[],
    private readonly connectImpl: (appId: string) => Promise<void> = async () => undefined
  ) {}
  async connect(appId: string) {
    this.log.push(`connect:${appId}`)
    await this.connectImpl(appId)
    this.connected = appId
  }
  async setActivity(a: ActivityPayload) {
    this.activity = a
    this.log.push(`activity:${a.details}`)
  }
  async clear() {
    this.activity = null
    this.log.push('clear')
  }
  async disconnect() {
    this.disconnected = true
    this.log.push(`disconnect:${this.connected}`)
  }
  onClose(cb: () => void) {
    this.closeCb = cb
  }
}

const look = (o: Partial<Look> = {}): Look => ({
  id: 'a',
  name: 'A',
  kind: 'game',
  appId: '111',
  gameName: 'Game',
  details: 'details',
  state: 'state',
  largeImageUrl: '',
  smallImageUrl: '',
  showTimer: false,
  ...o
})

function setup(connectImpl?: (appId: string) => Promise<void>) {
  const log: string[] = []
  const clients: FakeClient[] = []
  const statuses: PresenceStatus[] = []
  const manager = new PresenceManager(
    () => {
      const c = new FakeClient(log, connectImpl)
      clients.push(c)
      return c
    },
    (s) => statuses.push(s)
  )
  return { log, clients, statuses, manager }
}

afterEach(() => vi.useRealTimers())

test('goLive connects with the look appId, sets activity and is live', async () => {
  const { log, manager } = setup()
  await manager.goLive(look())
  expect(log).toEqual(['connect:111', 'activity:details'])
  expect(manager.status()).toEqual({ state: 'live', lookId: 'a', message: null })
})

test('timer look includes startTimestamp, non-timer omits it', () => {
  expect(buildActivity(look({ showTimer: true }), 1000).startTimestamp).toBe(1000)
  expect('startTimestamp' in buildActivity(look(), 1000)).toBe(false)
})

test('custom looks use the Shimacord app id and omit empty fields', async () => {
  const { log, manager } = setup()
  await manager.goLive(look({ kind: 'custom', appId: null, state: '' }))
  expect(log[0]).toBe(`connect:${SHIMACORD_APP_ID}`)
  expect('state' in buildActivity(look({ state: '' }), 1)).toBe(false)
})

test('switching looks disconnects the old client before connecting the new one', async () => {
  const { log, manager } = setup()
  await manager.goLive(look())
  await manager.goLive(look({ id: 'b', appId: '222', details: 'second' }))
  expect(log.indexOf('disconnect:111')).toBeLessThan(log.indexOf('connect:222'))
  expect(manager.status().lookId).toBe('b')
})

test('two rapid goLive calls end with only the last look live', async () => {
  const { clients, manager } = setup(() => new Promise((r) => setTimeout(r, 10)))
  vi.useFakeTimers()
  const p1 = manager.goLive(look())
  const p2 = manager.goLive(look({ id: 'b', appId: '222', details: 'second' }))
  await vi.advanceTimersByTimeAsync(50)
  await Promise.all([p1, p2])
  const live = clients.filter((c) => c.connected && !c.disconnected)
  expect(live).toHaveLength(1)
  expect(live[0].activity?.details).toBe('second')
  expect(manager.status().lookId).toBe('b')
})

test('discord not found gives discord-missing', async () => {
  const { manager } = setup(async () => {
    throw new DiscordMissingError()
  })
  await manager.goLive(look())
  expect(manager.status().state).toBe('discord-missing')
  await manager.stop()
})

test('discord-missing retries every 5s and goes live when Discord returns', async () => {
  vi.useFakeTimers()
  let attempts = 0
  const { manager } = setup(async () => {
    attempts++
    if (attempts < 3) throw new DiscordMissingError()
  })
  await manager.goLive(look())
  expect(manager.status().state).toBe('discord-missing')
  await vi.advanceTimersByTimeAsync(5000)
  expect(manager.status().state).toBe('discord-missing')
  await vi.advanceTimersByTimeAsync(5000)
  expect(manager.status()).toEqual({ state: 'live', lookId: 'a', message: null })
})

test('close while live reconnects and restores the same look', async () => {
  vi.useFakeTimers()
  const { clients, manager } = setup()
  await manager.goLive(look())
  clients[0].closeCb?.()
  expect(manager.status().state).toBe('discord-missing')
  await vi.advanceTimersByTimeAsync(5000)
  expect(manager.status()).toEqual({ state: 'live', lookId: 'a', message: null })
  expect(clients.at(-1)?.activity?.details).toBe('details')
})

test('other connect errors give error state with the message and do not retry', async () => {
  vi.useFakeTimers()
  const { clients, manager } = setup(async () => {
    throw new Error('boom')
  })
  await manager.goLive(look())
  expect(manager.status()).toEqual({ state: 'error', lookId: 'a', message: 'boom' })
  await vi.advanceTimersByTimeAsync(20000)
  expect(clients).toHaveLength(1)
})

test('stop clears and returns to idle', async () => {
  const { log, manager } = setup()
  await manager.goLive(look())
  await manager.stop()
  expect(log).toContain('clear')
  expect(manager.status()).toEqual({ state: 'idle', lookId: null, message: null })
})

test('stop cancels a pending retry', async () => {
  vi.useFakeTimers()
  const { clients, manager } = setup(async () => {
    throw new DiscordMissingError()
  })
  await manager.goLive(look())
  await manager.stop()
  await vi.advanceTimersByTimeAsync(20000)
  expect(clients).toHaveLength(1)
})

test('a close event firing twice schedules only one retry', async () => {
  vi.useFakeTimers()
  const { clients, manager } = setup()
  await manager.goLive(look())
  clients[0].closeCb?.()
  clients[0].closeCb?.()
  await vi.advanceTimersByTimeAsync(5000)
  expect(clients).toHaveLength(2)
  expect(manager.status().state).toBe('live')
})

test('a custom look connects under the Shimacord app id even if appId is stale', async () => {
  const { log, manager } = setup()
  await manager.goLive(look({ kind: 'custom', appId: '111', gameName: 'Old' }))
  expect(log[0]).toBe(`connect:${SHIMACORD_APP_ID}`)
})

test('lookUpdated re-sends the activity when that look is live', async () => {
  const { log, manager } = setup()
  await manager.goLive(look())
  await manager.lookUpdated(look({ details: 'edited' }))
  expect(log).toContain('activity:edited')
  expect(manager.status().state).toBe('live')
})

test('lookUpdated ignores a look that is not live', async () => {
  const { log, manager } = setup()
  await manager.goLive(look())
  await manager.lookUpdated(look({ id: 'other', details: 'edited' }))
  expect(log).not.toContain('activity:edited')
})

test('lookRemoved stops presence when the live look is removed', async () => {
  const { manager } = setup()
  await manager.goLive(look())
  await manager.lookRemoved('a')
  expect(manager.status().state).toBe('idle')
})

test('lookRemoved leaves presence alone for another look', async () => {
  const { manager } = setup()
  await manager.goLive(look())
  await manager.lookRemoved('zzz')
  expect(manager.status().state).toBe('live')
})
