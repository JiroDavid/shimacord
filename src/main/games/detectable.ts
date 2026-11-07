import { readFileSync, writeFileSync } from 'fs'
import type { GameEntry } from '../../shared/types'

const URL = 'https://discord.com/api/v9/applications/detectable'

type RawApp = { id: string; name?: string; icon?: string | null }

const toEntry = (app: RawApp): GameEntry | null =>
  app.name
    ? {
        appId: app.id,
        name: app.name,
        iconUrl: app.icon ? `https://cdn.discordapp.com/app-icons/${app.id}/${app.icon}.png` : null
      }
    : null

export class GameCatalog {
  private games: GameEntry[] = []

  constructor(
    private readonly cachePath: string,
    private readonly fetchImpl: typeof fetch
  ) {}

  async load(): Promise<{ games: GameEntry[]; source: 'network' | 'cache' | 'none' }> {
    try {
      const res = await this.fetchImpl(URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = (await res.json()) as RawApp[]
      this.games = raw.map(toEntry).filter((g): g is GameEntry => g !== null)
      writeFileSync(this.cachePath, JSON.stringify(this.games))
      return { games: this.games, source: 'network' }
    } catch {
      try {
        this.games = JSON.parse(readFileSync(this.cachePath, 'utf8')) as GameEntry[]
        return { games: this.games, source: 'cache' }
      } catch {
        this.games = []
        return { games: [], source: 'none' }
      }
    }
  }

  search(query: string, limit = 8): GameEntry[] {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const prefix: GameEntry[] = []
    const rest: GameEntry[] = []
    for (const g of this.games) {
      const name = g.name.toLowerCase()
      if (name.startsWith(q)) prefix.push(g)
      else if (name.includes(q)) rest.push(g)
    }
    return [...prefix, ...rest].slice(0, limit)
  }
}
