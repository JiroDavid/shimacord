// THROWAWAY: Task 1 spike. Usage: node scripts/spike.mjs <applicationId> <details> <state> <imageUrl>
import { Client } from '@xhayper/discord-rpc'

const [appId, details, state, imageUrl] = process.argv.slice(2)
if (!appId) {
  console.error('usage: node scripts/spike.mjs <applicationId> <details> <state> <imageUrl>')
  process.exit(1)
}

const client = new Client({ clientId: appId })
client.on('ready', async () => {
  const result = await client.user?.setActivity({
    details,
    state,
    largeImageKey: imageUrl,
    startTimestamp: Date.now()
  })
  console.log('activity set:', result ? 'ok' : 'no result')
})

process.on('SIGINT', async () => {
  await client.user?.clearActivity()
  await client.destroy()
  process.exit(0)
})

await client.login()
