import type { Look, PresenceStatus } from '../../shared/types'
import { DiscordMissingError, SHIMACORD_APP_ID } from './client'
import type { ActivityPayload, PresenceClient } from './client'

const RETRY_MS = 5000

export function buildActivity(look: Look, startedAt: number): ActivityPayload {
  const activity: ActivityPayload = { details: look.details }
  if (look.state) activity.state = look.state
  if (look.largeImageUrl) activity.largeImageKey = look.largeImageUrl
  if (look.smallImageUrl) activity.smallImageKey = look.smallImageUrl
  if (look.showTimer) activity.startTimestamp = startedAt
  return activity
}

const IDLE: PresenceStatus = { state: 'idle', lookId: null, message: null }

export class PresenceManager {
  private current: PresenceStatus = IDLE
  private client: PresenceClient | null = null
  private request = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private startedAt = 0

  constructor(
    private readonly makeClient: () => PresenceClient,
    private readonly onStatus: (s: PresenceStatus) => void
  ) {}

  status(): PresenceStatus {
    return this.current
  }

  async goLive(look: Look): Promise<void> {
    const request = ++this.request
    this.cancelRetry()
    this.startedAt = Date.now()
    await this.connect(look, request)
  }

  async stop(): Promise<void> {
    ++this.request
    this.cancelRetry()
    const client = this.client
    this.client = null
    if (client) {
      await client.clear().catch(() => undefined)
      await client.disconnect()
    }
    this.set(IDLE)
  }

  async lookUpdated(look: Look): Promise<void> {
    if (this.current.lookId !== look.id || this.current.state === 'idle') return
    await this.goLive(look)
  }

  async lookRemoved(id: string): Promise<void> {
    if (this.current.lookId === id) await this.stop()
  }

  private async connect(look: Look, request: number): Promise<void> {
    this.set({ state: 'connecting', lookId: look.id, message: null })
    const old = this.client
    this.client = null
    if (old) await old.disconnect()
    if (request !== this.request) return

    const client = this.makeClient()
    this.client = client
    try {
      await client.connect(look.kind === 'game' && look.appId ? look.appId : SHIMACORD_APP_ID)
      if (request !== this.request) {
        await client.disconnect()
        return
      }
      client.onClose(() => this.handleClose(look, request))
      await client.setActivity(buildActivity(look, this.startedAt))
      if (request !== this.request) return
      this.set({ state: 'live', lookId: look.id, message: null })
    } catch (err) {
      if (request !== this.request) {
        await client.disconnect()
        return
      }
      this.client = null
      await client.disconnect()
      if (err instanceof DiscordMissingError) this.waitForDiscord(look, request)
      else {
        this.set({
          state: 'error',
          lookId: look.id,
          message: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }
  }

  private handleClose(look: Look, request: number): void {
    if (request !== this.request) return
    this.client = null
    this.waitForDiscord(look, request)
  }

  private waitForDiscord(look: Look, request: number): void {
    this.cancelRetry()
    this.set({ state: 'discord-missing', lookId: look.id, message: 'Discord not found' })
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      if (request === this.request) void this.connect(look, request)
    }, RETRY_MS)
  }

  private cancelRetry(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.retryTimer = null
  }

  private set(status: PresenceStatus): void {
    this.current = status
    this.onStatus(status)
  }
}
