import { mkdtempSync, existsSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { GameCatalog } from './detectable'

const apps = [
  { id: '1', name: 'Valorant', icon: 'abc' },
  { id: '2', name: 'Overvalorous', icon: null },
  { id: '3' },
  { id: '4', name: 'Minecraft', icon: 'def' }
]
const okFetch = (async () => ({ ok: true, json: async () => apps })) as unknown as typeof fetch
const badFetch = (async () => {
  throw new Error('offline')
}) as unknown as typeof fetch
const cachePath = () => join(mkdtempSync(join(tmpdir(), 'shima-')), 'games.json')

test('load from network writes the cache', async () => {
  const path = cachePath()
  const result = await new GameCatalog(path, okFetch).load()
  expect(result.source).toBe('network')
  expect(result.games.map((g) => g.name)).toEqual(['Valorant', 'Overvalorous', 'Minecraft'])
  expect(existsSync(path)).toBe(true)
})

test('rejecting fetch with a cache returns the cache', async () => {
  const path = cachePath()
  await new GameCatalog(path, okFetch).load()
  const result = await new GameCatalog(path, badFetch).load()
  expect(result.source).toBe('cache')
  expect(result.games).toHaveLength(3)
})

test('rejecting fetch with no cache returns none', async () => {
  const result = await new GameCatalog(cachePath(), badFetch).load()
  expect(result).toEqual({ games: [], source: 'none' })
})

test('corrupt cache with rejecting fetch returns none', async () => {
  const path = cachePath()
  writeFileSync(path, '{oops')
  expect((await new GameCatalog(path, badFetch).load()).source).toBe('none')
})

test('search is case-insensitive and prefers prefix matches', async () => {
  const catalog = new GameCatalog(cachePath(), okFetch)
  await catalog.load()
  expect(catalog.search('valo').map((g) => g.name)).toEqual(['Valorant', 'Overvalorous'])
})

test('search caps at limit', async () => {
  const catalog = new GameCatalog(cachePath(), okFetch)
  await catalog.load()
  expect(catalog.search('o', 1)).toHaveLength(1)
  expect(catalog.search('o').length).toBeLessThanOrEqual(8)
})

test('icon url is built from the icon hash', async () => {
  const catalog = new GameCatalog(cachePath(), okFetch)
  await catalog.load()
  expect(catalog.search('valorant')[0].iconUrl).toBe(
    'https://cdn.discordapp.com/app-icons/1/abc.png'
  )
  expect(catalog.search('overvalorous')[0].iconUrl).toBeNull()
})
