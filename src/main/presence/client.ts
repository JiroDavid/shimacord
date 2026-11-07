import { Client } from '@xhayper/discord-rpc'

export const SHIMACORD_APP_ID = process.env.SHIMACORD_APP_ID ?? 'REPLACE_WITH_SHIMACORD_APP_ID'

export type ActivityPayload = {
  details: string
  state?: string
  largeImageKey?: string
  smallImageKey?: string
  startTimestamp?: number
}

export class DiscordMissingError extends Error {
  constructor(message = 'Discord not found') {
    super(message)
    this.name = 'DiscordMissingError'
  }
}

export interface PresenceClient {
  connect(appId: string): Promise<void>
  setActivity(a: ActivityPayload): Promise<void>
  clear(): Promise<void>
  disconnect(): Promise<void>
  onClose(cb: () => void): void
}

export class DiscordRpcClient implements PresenceClient {
  private client: Client | null = null
  private closeCb: (() => void) | null = null

  async connect(appId: string): Promise<void> {
    const client = new Client({ clientId: appId })
    client.on('disconnected', () => this.closeCb?.())
    try {
      await client.login()
    } catch (err) {
      throw new DiscordMissingError(err instanceof Error ? err.message : undefined)
    }
    this.client = client
  }

  async setActivity(a: ActivityPayload): Promise<void> {
    await this.client?.user?.setActivity(a)
  }

  async clear(): Promise<void> {
    await this.client?.user?.clearActivity()
  }

  async disconnect(): Promise<void> {
    const client = this.client
    this.client = null
    this.closeCb = null
    await client?.destroy().catch(() => undefined)
  }

  onClose(cb: () => void): void {
    this.closeCb = cb
  }
}
