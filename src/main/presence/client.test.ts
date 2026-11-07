import { DiscordRpcClient, isDiscordMissing, PLACEHOLDER_APP_ID } from './client'

test('only could-not-connect and could-not-find-client errors mean Discord is missing', () => {
  expect(isDiscordMissing(Object.assign(new Error('x'), { code: 2 }))).toBe(true)
  expect(isDiscordMissing(Object.assign(new Error('x'), { code: 3 }))).toBe(true)
  expect(isDiscordMissing(Object.assign(new Error('Connection ended'), { code: 0 }))).toBe(false)
  expect(isDiscordMissing(new Error('plain'))).toBe(false)
})

test('connecting with the placeholder app id fails with a clear setup message', async () => {
  await expect(new DiscordRpcClient().connect(PLACEHOLDER_APP_ID)).rejects.toThrow(/SHIMACORD_APP_ID/)
})
