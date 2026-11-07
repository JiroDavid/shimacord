import { app, BrowserWindow, ipcMain, Menu, nativeImage, Tray } from 'electron'
import { join } from 'path'
import { LooksStore } from './store/looks-store'
import { GameCatalog } from './games/detectable'
import { PresenceManager } from './presence/manager'
import { DiscordRpcClient } from './presence/client'
import { buildTrayMenu } from './tray'
import { validateLook } from '../shared/validate'
import type { PresenceStatus } from '../shared/types'

let win: BrowserWindow | null = null
let tray: Tray | null = null
let quitting = false

if (!app.requestSingleInstanceLock()) app.quit()

const showWindow = (): void => {
  if (!win) return
  win.show()
  win.focus()
}

function createWindow(): BrowserWindow {
  const w = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 900,
    minHeight: 560,
    backgroundColor: '#ece5d6',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  w.on('close', (e) => {
    if (!quitting) {
      e.preventDefault()
      w.hide()
    }
  })
  if (process.env.ELECTRON_RENDERER_URL) w.loadURL(process.env.ELECTRON_RENDERER_URL)
  else w.loadFile(join(__dirname, '../renderer/index.html'))
  return w
}

app.on('second-instance', showWindow)
app.on('before-quit', () => {
  quitting = true
})

app.whenReady().then(async () => {
  const dir = app.getPath('userData')
  const store = new LooksStore(join(dir, 'looks.json'))
  const catalog = new GameCatalog(join(dir, 'games.json'), fetch)
  const gamesLoaded = catalog.load()

  const refreshTray = (status: PresenceStatus): void => {
    tray?.setContextMenu(
      Menu.buildFromTemplate(
        buildTrayMenu(store.list(), status, {
          goLive: (id) => void goLive(id),
          stop: () => void manager.stop(),
          show: showWindow,
          quit: () => app.quit()
        })
      )
    )
  }

  const manager = new PresenceManager(
    () => new DiscordRpcClient(),
    (status) => {
      win?.webContents.send('presence:status', status)
      refreshTray(status)
    }
  )

  const goLive = async (id: string): Promise<void> => {
    const look = store.list().find((l) => l.id === id)
    if (!look) return
    const { id: _id, ...input } = look
    if (validateLook(input).length > 0) return
    await manager.goLive(look)
  }

  ipcMain.handle('looks:list', () => store.list())
  ipcMain.handle('looks:save', (_, input, id) => {
    const saved = store.save(input, id)
    refreshTray(manager.status())
    return saved
  })
  ipcMain.handle('looks:duplicate', (_, id) => {
    const copy = store.duplicate(id)
    refreshTray(manager.status())
    return copy
  })
  ipcMain.handle('looks:remove', (_, id) => {
    store.remove(id)
    refreshTray(manager.status())
  })
  ipcMain.handle('games:search', (_, query: string) => catalog.search(query))
  ipcMain.handle('games:status', async () => (await gamesLoaded).source)
  ipcMain.handle('presence:goLive', (_, id: string) => goLive(id))
  ipcMain.handle('presence:stop', () => manager.stop())
  ipcMain.handle('presence:status', () => manager.status())

  win = createWindow()
  tray = new Tray(nativeImage.createFromPath(join(__dirname, '../../resources/tray.png')))
  tray.setToolTip('Shimacord')
  tray.on('click', showWindow)
  refreshTray(manager.status())

})
