import { Client } from '@xhayper/discord-rpc'

declare const __SHIMACORD_APP_ID__: string | undefined

export const PLACEHOLDER_APP_ID = 'REPLACE_WITH_SHIMACORD_APP_ID'

export const SHIMACORD_APP_ID =
  (typeof __SHIMACORD_APP_ID__ !== 'undefined' && __SHIMACORD_APP_ID__) ||
  process.env.SHIMACORD_APP_ID ||
  PLACEHOLDER_APP_ID

const COULD_NOT_CONNECT = 2
const COULD_NOT_FIND_CLIENT = 3

export function isDiscordMissing(err: unknown): boolean {
  const code = (err as { code?: number } | null)?.code
  return code === COULD_NOT_CONNECT || code === COULD_NOT_FIND_CLIENT
}

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
    if (appId === PLACEHOLDER_APP_ID) {
      throw new Error('Shimacord application ID is not set - see SHIMACORD_APP_ID in the README')
    }
    const client = new Client({ clientId: appId })
    let closed = false
    const notifyClosed = (): void => {
      if (closed) return
      closed = true
      this.closeCb?.()
    }
    client.on('disconnected', notifyClosed)
    try {
      await client.login()
    } catch (err) {
      await client.destroy().catch(() => undefined)
      if (isDiscordMissing(err)) throw new DiscordMissingError(err instanceof Error ? err.message : undefined)
      throw err
    }
    // the library's own 'disconnected' event is skipped when the socket is already closed
    const socket = (client.transport as unknown as { socket?: { once(e: string, cb: () => void): void } }).socket
    socket?.once('close', notifyClosed)
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
