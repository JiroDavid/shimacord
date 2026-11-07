export type Look = {
  id: string
  name: string
  kind: 'game' | 'custom'
  appId: string | null
  gameName: string | null
  details: string
  state: string
  largeImageUrl: string
  smallImageUrl: string
  showTimer: boolean
}

export type LookInput = Omit<Look, 'id'>

export type GameEntry = { appId: string; name: string; iconUrl: string | null }

export type PresenceStatus = {
  state: 'idle' | 'connecting' | 'live' | 'discord-missing' | 'error'
  lookId: string | null
  message: string | null
}
