import type { MenuItemConstructorOptions } from 'electron'
import type { Look, PresenceStatus } from '../shared/types'

export type TrayActions = {
  goLive: (id: string) => void
  stop: () => void
  show: () => void
  quit: () => void
}

export function buildTrayMenu(
  looks: Look[],
  status: PresenceStatus,
  actions: TrayActions
): MenuItemConstructorOptions[] {
  const isLive = status.state === 'live'
  return [
    { label: 'Open Shimacord', click: () => actions.show() },
    { type: 'separator' },
    ...looks.map(
      (look): MenuItemConstructorOptions => ({
        label: look.name,
        type: 'checkbox',
        checked: isLive && status.lookId === look.id,
        click: () => actions.goLive(look.id)
      })
    ),
    { type: 'separator' },
    { label: 'Stop', enabled: isLive, click: () => actions.stop() },
    { label: 'Quit', click: () => actions.quit() }
  ]
}
