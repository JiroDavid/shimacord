import type { LookInput } from './types'

const isHttps = (value: string): boolean => {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

const isDiscordAttachment = (value: string): boolean => {
  try {
    const { hostname, pathname } = new URL(value)
    return (
      (hostname === 'cdn.discordapp.com' || hostname === 'media.discordapp.net') &&
      pathname.startsWith('/attachments/')
    )
  } catch {
    return false
  }
}

const ATTACHMENT_HINT =
  'Discord attachment links expire and will not show - host the image on imgur or GitHub (raw link) instead.'

export function validateLook(input: LookInput): string[] {
  const errors: string[] = []
  if (!input.name.trim()) errors.push('Give the look a name.')
  if (input.details.length < 2 || input.details.length > 128) {
    errors.push('Details must be 2 to 128 characters.')
  }
  if (input.state !== '' && (input.state.length < 2 || input.state.length > 128)) {
    errors.push('State must be empty or 2 to 128 characters.')
  }
  for (const [value, name] of [
    [input.largeImageUrl, 'Large'],
    [input.smallImageUrl, 'Small']
  ]) {
    if (value && !isHttps(value)) errors.push(`${name} image must be an https link.`)
    else if (value && isDiscordAttachment(value)) errors.push(`${name} image: ${ATTACHMENT_HINT}`)
  }
  if (input.kind === 'game' && !input.appId) errors.push('Pick a game.')
  return errors
}
