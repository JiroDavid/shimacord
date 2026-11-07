import { validateLook } from './validate'
import type { LookInput } from './types'

const base: LookInput = {
  name: 'Test',
  kind: 'custom',
  appId: null,
  gameName: null,
  details: 'hello there',
  state: 'ok',
  largeImageUrl: '',
  smallImageUrl: '',
  showTimer: false
}
const make = (o: Partial<LookInput>): LookInput => ({ ...base, ...o })

test('valid look has no errors', () => {
  expect(validateLook(base)).toEqual([])
})

test('details of 1 char is an error', () => {
  expect(validateLook(make({ details: 'a' })).length).toBeGreaterThan(0)
})

test('details of 129 chars is an error', () => {
  expect(validateLook(make({ details: 'a'.repeat(129) })).length).toBeGreaterThan(0)
})

test('details of 2 and 128 chars pass', () => {
  expect(validateLook(make({ details: 'ab' }))).toEqual([])
  expect(validateLook(make({ details: 'a'.repeat(128) }))).toEqual([])
})

test('empty details with a state is an error', () => {
  expect(validateLook(make({ details: '', state: 'something' })).length).toBeGreaterThan(0)
})

test('state of 1 or 129 chars is an error, empty passes', () => {
  expect(validateLook(make({ state: 'a' })).length).toBeGreaterThan(0)
  expect(validateLook(make({ state: 'a'.repeat(129) })).length).toBeGreaterThan(0)
  expect(validateLook(make({ state: '' }))).toEqual([])
})

test('non-https image url is an error', () => {
  expect(validateLook(make({ largeImageUrl: 'http://x.com/a.png' })).length).toBeGreaterThan(0)
  expect(validateLook(make({ smallImageUrl: 'not a url' })).length).toBeGreaterThan(0)
})

test('https image url and empty image url pass', () => {
  expect(validateLook(make({ largeImageUrl: 'https://x.com/a.png' }))).toEqual([])
})

test('game look without appId is an error', () => {
  expect(validateLook(make({ kind: 'game', appId: null })).length).toBeGreaterThan(0)
  expect(validateLook(make({ kind: 'game', appId: '123', gameName: 'G' }))).toEqual([])
})

test('discord attachment links are rejected with a hint', () => {
  const url = 'https://cdn.discordapp.com/attachments/1/2/a.jpg?ex=1&is=2&hm=3'
  expect(validateLook(make({ largeImageUrl: url })).join(' ')).toMatch(/imgur|GitHub/i)
  expect(validateLook(make({ smallImageUrl: url })).length).toBeGreaterThan(0)
  expect(validateLook(make({ largeImageUrl: 'https://media.discordapp.net/attachments/1/2/a.png' })).length).toBeGreaterThan(0)
})

test('other discord cdn urls are not rejected', () => {
  expect(validateLook(make({ largeImageUrl: 'https://cdn.discordapp.com/app-icons/1/a.png' }))).toEqual([])
})
