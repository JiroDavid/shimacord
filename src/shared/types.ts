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
