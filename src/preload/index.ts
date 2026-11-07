import { contextBridge, ipcRenderer } from 'electron'
import type { PresenceStatus, ShimaApi } from '../shared/types'

const api: ShimaApi = {
  looks: {
    list: () => ipcRenderer.invoke('looks:list'),
    save: (input, id) => ipcRenderer.invoke('looks:save', input, id),
    duplicate: (id) => ipcRenderer.invoke('looks:duplicate', id),
    remove: (id) => ipcRenderer.invoke('looks:remove', id)
  },
  games: {
    search: (query) => ipcRenderer.invoke('games:search', query),
    status: () => ipcRenderer.invoke('games:status')
  },
  presence: {
    goLive: (id) => ipcRenderer.invoke('presence:goLive', id),
    stop: () => ipcRenderer.invoke('presence:stop'),
    status: () => ipcRenderer.invoke('presence:status'),
    onStatus: (cb) => {
      const handler = (_: unknown, s: PresenceStatus) => cb(s)
      ipcRenderer.on('presence:status', handler)
      return () => ipcRenderer.removeListener('presence:status', handler)
    }
  }
}

contextBridge.exposeInMainWorld('shima', api)
