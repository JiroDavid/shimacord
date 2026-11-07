import { mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { LooksStore } from './looks-store'
import type { LookInput } from '../../shared/types'

const input: LookInput = {
  name: 'Chill',
  kind: 'custom',
  appId: null,
  gameName: null,
  details: 'resting',
  state: 'zzz',
  largeImageUrl: '',
  smallImageUrl: '',
  showTimer: true
}

const tmp = () => join(mkdtempSync(join(tmpdir(), 'shima-')), 'looks.json')

test('save then list round-trips', () => {
  const file = tmp()
  const saved = new LooksStore(file).save(input)
  expect(new LooksStore(file).list()).toEqual([saved])
})

test('save with id replaces that look', () => {
  const store = new LooksStore(tmp())
  const a = store.save(input)
  store.save({ ...input, name: 'Renamed' }, a.id)
  expect(store.list()).toHaveLength(1)
  expect(store.list()[0].name).toBe('Renamed')
})

test('duplicate appends copy and gets a new id', () => {
  const store = new LooksStore(tmp())
  const a = store.save(input)
  const b = store.duplicate(a.id)
  expect(b.name).toBe('Chill copy')
  expect(b.id).not.toBe(a.id)
  expect(store.list()).toHaveLength(2)
})

test('remove deletes', () => {
  const store = new LooksStore(tmp())
  const a = store.save(input)
  store.remove(a.id)
  expect(store.list()).toEqual([])
})

test('missing file yields empty list', () => {
  expect(new LooksStore(tmp()).list()).toEqual([])
})

test('corrupt file yields empty list and keeps a backup', () => {
  const file = tmp()
  writeFileSync(file, '{not json')
  expect(new LooksStore(file).list()).toEqual([])
  expect(readFileSync(file + '.bak', 'utf8')).toBe('{not json')
})

test('writes leave no temp file behind and go through rename', () => {
  const file = tmp()
  new LooksStore(file).save(input)
  expect(existsSync(file)).toBe(true)
  const dir = file.slice(0, file.lastIndexOf('/'))
  expect(readdirSync(dir)).toEqual(['looks.json'])
})
