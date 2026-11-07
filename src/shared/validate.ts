import type { LookInput } from './types'

const isHttps = (value: string): boolean => {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function validateLook(input: LookInput): string[] {
  const errors: string[] = []
  if (!input.name.trim()) errors.push('Give the look a name.')
  if (input.details.length < 2 || input.details.length > 128) {
    errors.push('Details must be 2 to 128 characters.')
  }
  if (input.state !== '' && (input.state.length < 2 || input.state.length > 128)) {
    errors.push('State must be empty or 2 to 128 characters.')
  }
  if (input.largeImageUrl && !isHttps(input.largeImageUrl)) {
    errors.push('Large image must be an https link.')
  }
  if (input.smallImageUrl && !isHttps(input.smallImageUrl)) {
    errors.push('Small image must be an https link.')
  }
  if (input.kind === 'game' && !input.appId) errors.push('Pick a game.')
  return errors
}
